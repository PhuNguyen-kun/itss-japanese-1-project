const db = require("../models");
const { BadRequestError, NotFoundError } = require("../utils/ApiError");
const {
  getPaginationParams,
  getPaginationMeta,
} = require("../utils/pagination");
const notificationService = require("./notificationService");

class CommentService {
  async getByStoryId(storyId, query = {}) {
    const { page, per_page, offset } = getPaginationParams(query);

    // Check if story exists
    const story = await db.Story.findByPk(storyId);
    if (!story) {
      throw new NotFoundError("Story not found");
    }

    // Get all comments (parent and replies) for this story
    const allComments = await db.Comment.findAll({
      where: { story_id: storyId },
      include: [
        {
          model: db.User,
          as: "author",
          attributes: [
            "id",
            "first_name",
            "last_name",
            "username",
            "avatar_url",
          ],
        },
        {
          model: db.Reaction,
          as: "reactions",
          attributes: ["id", "user_id", "reaction_type"],
          include: [
            {
              model: db.User,
              as: "user",
              attributes: ["id", "first_name", "last_name", "username"],
            },
          ],
        },
      ],
    });

    // Calculate vote score for each comment
    const commentsWithScore = allComments.map(comment => {
      const commentJson = comment.toJSON();
      const upvotes = commentJson.reactions?.filter(r => r.reaction_type === 'upvote').length || 0;
      const downvotes = commentJson.reactions?.filter(r => r.reaction_type === 'downvote').length || 0;
      return {
        ...commentJson,
        vote_score: upvotes - downvotes,
        upvotes,
        downvotes,
      };
    });

    // Separate parent comments and replies
    const parentComments = commentsWithScore.filter(c => !c.parent_id);
    const replies = commentsWithScore.filter(c => c.parent_id);

    // Build nested structure
    const nestedComments = parentComments.map(parent => {
      const commentReplies = replies
        .filter(r => r.parent_id === parent.id)
        .sort((a, b) => b.vote_score - a.vote_score); // Sort replies by vote
      
      return {
        ...parent,
        replies: commentReplies,
      };
    });

    // Sort parent comments by vote score (descending)
    const sortedComments = nestedComments.sort((a, b) => b.vote_score - a.vote_score);

    const count = parentComments.length;
    const pagination = getPaginationMeta(count, page, per_page);

    // Apply pagination to parent comments only
    const paginatedComments = sortedComments.slice(offset, offset + per_page);

    return { comments: paginatedComments, pagination };
  }

  async getById(id) {
    const comment = await db.Comment.findOne({
      where: { id },
      include: [
        {
          model: db.User,
          as: "author",
          attributes: [
            "id",
            "first_name",
            "last_name",
            "username",
            "avatar_url",
          ],
        },
        {
          model: db.Reaction,
          as: "reactions",
          attributes: ["id", "user_id", "reaction_type"],
          include: [
            {
              model: db.User,
              as: "user",
              attributes: ["id", "first_name", "last_name", "username"],
            },
          ],
        },
      ],
    });

    if (!comment) {
      throw new NotFoundError("Comment not found");
    }

    return comment;
  }

  async create(storyId, commentData, userId) {
    // Check if story exists
    const story = await db.Story.findByPk(storyId);
    if (!story) {
      throw new NotFoundError("Story not found");
    }

    // If parent_id is provided, check if parent comment exists
    if (commentData.parent_id) {
      const parentComment = await db.Comment.findByPk(commentData.parent_id);
      if (!parentComment) {
        throw new NotFoundError("Parent comment not found");
      }
    }

    const comment = await db.Comment.create({
      ...commentData,
      story_id: storyId,
      user_id: userId,
    });

    // Increment comment count (only for parent comments)
    if (!commentData.parent_id) {
      await story.increment("comment_count");
    }

    // Create notification for story owner (if not commenting on own story)
    if (story.user_id !== userId && !commentData.parent_id) {
      try {
        const commenter = await db.User.findByPk(userId);
        await notificationService.createNotification({
          user_id: story.user_id,
          actor_id: userId,
          type: "comment_on_story",
          entity_type: "story",
          entity_id: storyId,
          message: `${commenter.first_name} ${commenter.last_name}さんがあなたのストーリーにコメントしました`,
        });
      } catch (error) {
        // Log error but don't fail the comment creation
        console.error("Failed to create notification:", error);
      }
    }

    // Create notification for parent comment owner (if replying)
    if (commentData.parent_id) {
      try {
        const parentComment = await db.Comment.findByPk(commentData.parent_id);
        if (parentComment.user_id !== userId) {
          const commenter = await db.User.findByPk(userId);
          await notificationService.createNotification({
            user_id: parentComment.user_id,
            actor_id: userId,
            type: "reply_to_comment",
            entity_type: "comment",
            entity_id: commentData.parent_id,
            message: `${commenter.first_name} ${commenter.last_name}さんがあなたのコメントに返信しました`,
          });
        }
      } catch (error) {
        console.error("Failed to create notification:", error);
      }
    }

    return await this.getById(comment.id);
  }

  async update(id, commentData, userId) {
    const comment = await db.Comment.findOne({ where: { id } });

    if (!comment) {
      throw new NotFoundError("Comment not found");
    }

    // Check if user is the author
    if (comment.user_id !== userId) {
      throw new BadRequestError("You can only update your own comments");
    }

    await comment.update(commentData);

    return await this.getById(comment.id);
  }

  async delete(id, userId) {
    const comment = await db.Comment.findOne({ where: { id } });

    if (!comment) {
      throw new NotFoundError("Comment not found");
    }

    // Check if user is the author
    if (comment.user_id !== userId) {
      throw new BadRequestError("You can only delete your own comments");
    }

    const storyId = comment.story_id;
    await comment.destroy();

    // Decrement comment count
    const story = await db.Story.findByPk(storyId);
    if (story && story.comment_count > 0) {
      await story.decrement("comment_count");
    }

    return { message: "Comment deleted successfully" };
  }
}

module.exports = new CommentService();
