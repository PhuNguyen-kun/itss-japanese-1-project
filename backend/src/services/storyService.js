const db = require("../models");
const { BadRequestError, NotFoundError } = require("../utils/ApiError");
const {
  getPaginationParams,
  getPaginationMeta,
} = require("../utils/pagination");
const notificationService = require("./notificationService");
const followService = require("./followService");

class StoryService {
  async getAll(query = {}) {
    const { page, per_page, offset } = getPaginationParams(query);
    const { user_id } = query;

    const where = {};
    if (user_id) {
      where.user_id = user_id;
    }

    const { count, rows } = await db.Story.findAndCountAll({
      where,
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
          model: db.Topic,
          as: "topic",
          attributes: ["id", "name", "description"],
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
      order: [["created_at", "DESC"]],
      limit: per_page,
      offset,
      distinct: true,
    });

    // Get comment count and reactions count for each story
    const storiesWithCounts = await Promise.all(
      rows.map(async (story) => {
        const commentCount = await db.Comment.count({
          where: { story_id: story.id },
        });
        const reactionsCount = await db.Reaction.count({
          where: {
            target_type: "story",
            target_id: story.id,
          },
        });
        const storyJson = story.toJSON();
        // Parse image_url if it's a JSON string (for multiple images)
        if (storyJson.image_url) {
          try {
            const parsed = JSON.parse(storyJson.image_url);
            if (Array.isArray(parsed)) {
              storyJson.image_urls = parsed;
              // Keep first image for backward compatibility
              storyJson.image_url = parsed[0] || null;
            }
          } catch (e) {
            // If not JSON, keep as is (single image)
            storyJson.image_urls = [storyJson.image_url];
          }
        }
        return {
          ...storyJson,
          comment_count: commentCount,
          reactions_count: reactionsCount,
        };
      })
    );

    const pagination = getPaginationMeta(count, page, per_page);

    return { stories: storiesWithCounts, pagination };
  }

  async getById(id) {
    const story = await db.Story.findOne({
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
          model: db.Topic,
          as: "topic",
          attributes: ["id", "name", "description"],
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

    if (!story) {
      throw new NotFoundError("Story not found");
    }

    // Get comment count and reactions count
    const commentCount = await db.Comment.count({
      where: { story_id: story.id },
    });
    const reactionsCount = await db.Reaction.count({
      where: {
        target_type: "story",
        target_id: story.id,
      },
    });

    const storyJson = story.toJSON();
    // Parse image_url if it's a JSON string (for multiple images)
    if (storyJson.image_url) {
      try {
        const parsed = JSON.parse(storyJson.image_url);
        if (Array.isArray(parsed)) {
          storyJson.image_urls = parsed;
          // Keep first image for backward compatibility
          storyJson.image_url = parsed[0] || null;
        }
      } catch (e) {
        // If not JSON, keep as is (single image)
        storyJson.image_urls = [storyJson.image_url];
      }
    }

    return {
      ...storyJson,
      comment_count: commentCount,
      reactions_count: reactionsCount,
    };
  }

  async create(storyData, userId) {
    const story = await db.Story.create({
      ...storyData,
      user_id: userId,
    });

    // Get story with author info for notification
    const createdStory = await this.getById(story.id);
    const author = createdStory.author;

    // Create notifications for followers
    try {
      const followersResult = await followService.getFollowers(userId, { page: 1, per_page: 1000 });
      const followers = followersResult.followers || [];

      // Create notification for each follower
      await Promise.all(
        followers.map(async (follower) => {
          await notificationService.createNotification({
            user_id: follower.id,
            actor_id: userId,
            type: "user_posted_story",
            entity_type: "story",
            entity_id: story.id,
            message: `${author.first_name} ${author.last_name}さんが新しいストーリーを投稿しました`,
          });
        })
      );
    } catch (error) {
      // Log error but don't fail story creation
      console.error("Failed to create notifications for followers:", error);
    }

    return createdStory;
  }

  async update(id, storyData, userId) {
    const story = await db.Story.findOne({ where: { id } });

    if (!story) {
      throw new NotFoundError("Story not found");
    }

    // Check if user is the author
    if (story.user_id !== userId) {
      throw new BadRequestError("You can only update your own stories");
    }

    await story.update(storyData);

    return await this.getById(story.id);
  }

  async delete(id, userId) {
    const story = await db.Story.findOne({ where: { id } });

    if (!story) {
      throw new NotFoundError("Story not found");
    }

    // Check if user is the author
    if (story.user_id !== userId) {
      throw new BadRequestError("You can only delete your own stories");
    }

    await story.destroy();

    return { message: "Story deleted successfully" };
  }

  async incrementViewCount(id) {
    const story = await db.Story.findOne({ where: { id } });
    if (story) {
      await story.increment("view_count");
    }
  }

  async getTrending(query = {}) {
    const limit = parseInt(query.limit) || 20;

    // Get all stories with reactions and comments count calculated dynamically
    const stories = await db.Story.findAll({
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
          model: db.Topic,
          as: "topic",
          attributes: ["id", "name", "description"],
        },
      ],
      attributes: {
        include: [
          // Calculate reactions_count using subquery
          [
            db.sequelize.literal(
              `(SELECT COUNT(*) FROM reactions WHERE reactions.target_type = 'story' AND reactions.target_id = Story.id AND reactions.deleted_at IS NULL)`
            ),
            "reactions_count",
          ],
          // Calculate engagement score as reactions_count + comment_count
          [
            db.sequelize.literal(
              `((SELECT COUNT(*) FROM reactions WHERE reactions.target_type = 'story' AND reactions.target_id = Story.id AND reactions.deleted_at IS NULL) + comment_count)`
            ),
            "engagement_score",
          ],
        ],
      },
      order: [[db.sequelize.literal("engagement_score"), "DESC"]],
      limit,
      subQuery: false,
    });

    // Add rank to each story and parse image_url
    const rankedStories = stories.map((story, index) => {
      const storyJson = story.toJSON();
      
      // Parse image_url if it's a JSON string (for multiple images)
      if (storyJson.image_url) {
        try {
          const parsed = JSON.parse(storyJson.image_url);
          if (Array.isArray(parsed)) {
            storyJson.image_urls = parsed;
            // Keep first image for backward compatibility
            storyJson.image_url = parsed[0] || null;
          } else {
            storyJson.image_urls = [storyJson.image_url];
          }
        } catch (e) {
          // If not JSON, keep as is (single image)
          storyJson.image_urls = [storyJson.image_url];
        }
      }
      
      return {
        ...storyJson,
        rank: index + 1,
      };
    });

    return rankedStories;
  }
}

module.exports = new StoryService();
