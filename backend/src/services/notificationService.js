const db = require("../models");
const { BadRequestError, NotFoundError } = require("../utils/ApiError");
const {
  getPaginationParams,
  getPaginationMeta,
} = require("../utils/pagination");

class NotificationService {
  /**
   * Get notifications for a user with optional filtering
   */
  async getUserNotifications(userId, query = {}) {
    const { page, per_page, offset } = getPaginationParams(query);
    const { is_read } = query;

    const whereClause = { user_id: userId };

    // Filter by read status if specified
    if (is_read !== undefined) {
      whereClause.is_read = is_read === "true" || is_read === true;
    }

    const { count, rows } = await db.Notification.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: db.User,
          as: "actor",
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
      distinct: true,
    });

    // Manually fetch related stories for notifications
    const notificationsWithStories = await Promise.all(
      rows.map(async (notification) => {
        const notificationData = notification.toJSON();

        // Fetch story if entity_type is 'story'
        if (notification.entity_type === "story") {
          try {
            const story = await db.Story.findByPk(notification.entity_id, {
              attributes: ["id", "title", "content"],
            });
            notificationData.story = story;
          } catch (error) {
            console.error("Error fetching story:", error);
            notificationData.story = null;
          }
        }

        return notificationData;
      })
    );

    const pagination = getPaginationMeta(count, page, per_page);

    return { notifications: notificationsWithStories, pagination };
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId) {
    const count = await db.Notification.count({
      where: {
        user_id: userId,
        is_read: false,
      },
    });

    return { unread_count: count };
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(notificationId, userId) {
    const notification = await db.Notification.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundError("Notification not found");
    }

    // Check if user owns this notification
    if (notification.user_id !== userId) {
      throw new BadRequestError(
        "You can only mark your own notifications as read"
      );
    }

    // If already read, no need to update
    if (notification.is_read) {
      return notification;
    }

    await notification.update({ is_read: true });

    return notification;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    const [updatedCount] = await db.Notification.update(
      { is_read: true },
      {
        where: {
          user_id: userId,
          is_read: false,
        },
      }
    );

    return {
      message: "All notifications marked as read",
      updated_count: updatedCount,
    };
  }

  /**
   * Create a notification (internal use by other services)
   */
  async createNotification(data) {
    const { user_id, actor_id, type, entity_type, entity_id, message } = data;

    // Don't create notification if user is notifying themselves
    if (user_id === actor_id) {
      return null;
    }

    // Check if a similar unread notification already exists to avoid duplicates
    // For reactions, we check if there's already an unread reaction notification
    // from the same actor on the same entity
    if (type === "reaction_on_story") {
      const existingNotification = await db.Notification.findOne({
        where: {
          user_id,
          actor_id,
          type: "reaction_on_story",
          entity_type,
          entity_id,
          is_read: false,
        },
      });

      // If there's already an unread reaction notification, don't create a new one
      if (existingNotification) {
        return null;
      }
    }

    const notification = await db.Notification.create({
      user_id,
      actor_id,
      type,
      entity_type,
      entity_id,
      message,
      is_read: false,
    });

    return notification;
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId, userId) {
    const notification = await db.Notification.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundError("Notification not found");
    }

    // Check if user owns this notification
    if (notification.user_id !== userId) {
      throw new BadRequestError("You can only delete your own notifications");
    }

    await notification.destroy();

    return { message: "Notification deleted successfully" };
  }
}

module.exports = new NotificationService();
