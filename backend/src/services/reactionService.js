const db = require("../models");
const { BadRequestError, NotFoundError } = require("../utils/ApiError");
const {
  getPaginationParams,
  getPaginationMeta,
} = require("../utils/pagination");
const notificationService = require("./notificationService");

class ReactionService {
  async getByTarget(targetType, targetId, query = {}) {
    const { page, per_page, offset } = getPaginationParams(query);

    // Validate target exists
    if (targetType === "story") {
      const story = await db.Story.findByPk(targetId);
      if (!story) {
        throw new NotFoundError("Story not found");
      }
    } else if (targetType === "comment") {
      const comment = await db.Comment.findByPk(targetId);
      if (!comment) {
        throw new NotFoundError("Comment not found");
      }
    }

    const { count, rows } = await db.Reaction.findAndCountAll({
      where: {
        target_type: targetType,
        target_id: targetId,
      },
      include: [
        {
          model: db.User,
          as: "user",
          attributes: [
            "id",
            "first_name",
            "last_name",
            "username",
            "avatar_url",
          ],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: per_page,
      offset,
    });

    const pagination = getPaginationMeta(count, page, per_page);

    return { reactions: rows, pagination };
  }

  async create(reactionData, userId) {
    const { target_type, target_id, reaction_type } = reactionData;

    // Use transaction to prevent race conditions
    return await db.sequelize.transaction(async (transaction) => {
      // Validate target exists
      if (target_type === "story") {
        const story = await db.Story.findByPk(target_id, { transaction });
        if (!story) {
          throw new NotFoundError("Story not found");
        }
      } else if (target_type === "comment") {
        const comment = await db.Comment.findByPk(target_id, { transaction });
        if (!comment) {
          throw new NotFoundError("Comment not found");
        }
      }

      // Check if reaction already exists (with lock to prevent race condition)
      // Include soft-deleted records to handle the case where reaction was just deleted
      const existingReaction = await db.Reaction.findOne({
        where: {
          user_id: userId,
          target_type,
          target_id,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
        paranoid: false, // Include soft-deleted records
      });

      if (existingReaction) {
        // If reaction is soft-deleted, permanently delete it and create a new one
        // This is because our unique constraint includes deleted_at
        if (existingReaction.deleted_at !== null) {
          // Permanently delete the soft-deleted reaction
          await existingReaction.destroy({ force: true, transaction });

          // Fall through to create new reaction below
        } else {
          // Existing active reaction found
          // Update existing active reaction
          if (existingReaction.reaction_type === reaction_type) {
            // Same reaction type, remove it (toggle off)
            if (target_type === "story") {
              const story = await db.Story.findByPk(target_id, { transaction });
              if (story && story.like_count > 0) {
                await story.decrement("like_count", { transaction });
              }
            }
            await existingReaction.destroy({ transaction });
            return { message: "Reaction removed successfully", reaction: null };
          } else {
            // Different reaction type, update it (like_count stays the same)
            await existingReaction.update({ reaction_type }, { transaction });
            const updatedReaction = await db.Reaction.findByPk(
              existingReaction.id,
              {
                include: [
                  {
                    model: db.User,
                    as: "user",
                    attributes: [
                      "id",
                      "first_name",
                      "last_name",
                      "username",
                      "avatar_url",
                    ],
                  },
                ],
                transaction,
              }
            );
            return { reaction: updatedReaction };
          }
        }
      }

      // Create new reaction
      const reaction = await db.Reaction.create(
        {
          user_id: userId,
          target_type,
          target_id,
          reaction_type,
        },
        { transaction }
      );

      // Update like_count if reaction is on a story
      if (target_type === "story") {
        const story = await db.Story.findByPk(target_id, { transaction });
        if (story) {
          await story.increment("like_count", { transaction });

          // Create notification for story owner (if not reacting to own story)
          if (story.user_id !== userId) {
            try {
              const reactor = await db.User.findByPk(userId, { transaction });
              const reactionEmoji = {
                like: "👍",
                love: "❤️",
                haha: "😄",
                support: "🙌",
                sad: "😢",
              };
              await notificationService.createNotification({
                user_id: story.user_id,
                actor_id: userId,
                type: "reaction_on_story",
                entity_type: "story",
                entity_id: target_id,
                message: `${reactor.first_name} ${
                  reactor.last_name
                }さんがあなたのストーリーに${
                  reactionEmoji[reaction_type] || ""
                }リアクションしました`,
              });
            } catch (error) {
              // Log error but don't fail the reaction creation
              console.error("Failed to create notification:", error);
            }
          }
        }
      }

      const createdReaction = await db.Reaction.findByPk(reaction.id, {
        include: [
          {
            model: db.User,
            as: "user",
            attributes: [
              "id",
              "first_name",
              "last_name",
              "username",
              "avatar_url",
            ],
          },
        ],
        transaction,
      });

      return { reaction: createdReaction };
    });
  }

  async delete(id, userId) {
    const reaction = await db.Reaction.findOne({ where: { id } });

    if (!reaction) {
      throw new NotFoundError("Reaction not found");
    }

    // Check if user is the owner
    if (reaction.user_id !== userId) {
      throw new BadRequestError("You can only delete your own reactions");
    }

    // Decrement like_count if reaction is on a story
    if (reaction.target_type === "story") {
      const story = await db.Story.findByPk(reaction.target_id);
      if (story && story.like_count > 0) {
        await story.decrement("like_count");
      }
    }

    await reaction.destroy();

    return { message: "Reaction deleted successfully" };
  }
}

module.exports = new ReactionService();
