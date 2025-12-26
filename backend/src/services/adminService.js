const db = require("../models");
const { Op } = require("sequelize");
const { NotFoundError } = require("../utils/ApiError");
const { getPaginationMeta } = require("../utils/pagination");

class AdminService {
  // Get dashboard statistics
  async getDashboardStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total teachers (excluding admins)
    const totalTeachers = await db.User.count({
      where: {
        role: "teacher",
      },
    });

    // Active teachers this month (posted story or comment)
    // Get distinct user IDs who have stories or comments this month
    const activeUserIdsFromStories = await db.Story.findAll({
      attributes: [
        [db.sequelize.fn("DISTINCT", db.sequelize.col("user_id")), "user_id"],
      ],
      where: {
        created_at: {
          [Op.gte]: startOfMonth,
        },
      },
      raw: true,
    }).then((results) => results.map((r) => r.user_id));

    const activeUserIdsFromComments = await db.Comment.findAll({
      attributes: [
        [db.sequelize.fn("DISTINCT", db.sequelize.col("user_id")), "user_id"],
      ],
      where: {
        created_at: {
          [Op.gte]: startOfMonth,
        },
      },
      raw: true,
    }).then((results) => results.map((r) => r.user_id));

    const allActiveUserIds = [
      ...new Set([...activeUserIdsFromStories, ...activeUserIdsFromComments]),
    ];

    // Count how many of these are teachers
    const activeTeachersThisMonth = await db.User.count({
      where: {
        id: {
          [Op.in]: allActiveUserIds,
        },
        role: "teacher",
      },
    });

    // Total stories
    const totalStories = await db.Story.count();

    // Total shared documents
    const totalDocuments = await db.Document.count();

    return {
      total_teachers: totalTeachers,
      active_this_month: activeTeachersThisMonth || 0,
      total_stories: totalStories,
      total_documents: totalDocuments,
    };
  }

  // Get activity trend for last 30 days
  async getActivityTrend() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get stories per day for last 30 days
    const stories = await db.Story.findAll({
      attributes: [
        [
          db.sequelize.fn(
            "DATE_FORMAT",
            db.sequelize.col("created_at"),
            "%Y-%m-%d"
          ),
          "date",
        ],
        [db.sequelize.fn("COUNT", db.sequelize.col("id")), "count"],
      ],
      where: {
        created_at: {
          [Op.gte]: thirtyDaysAgo,
        },
      },
      group: [
        db.sequelize.fn(
          "DATE_FORMAT",
          db.sequelize.col("created_at"),
          "%Y-%m-%d"
        ),
      ],
      order: [
        [
          db.sequelize.fn(
            "DATE_FORMAT",
            db.sequelize.col("created_at"),
            "%Y-%m-%d"
          ),
          "ASC",
        ],
      ],
      raw: true,
    });

    // Generate all dates in range and fill missing dates with 0
    const dateMap = {};
    stories.forEach((item) => {
      const dateStr = item.date; // Already formatted as YYYY-MM-DD
      dateMap[dateStr] = parseInt(item.count);
    });

    const result = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      result.push({
        date: dateStr,
        count: dateMap[dateStr] || 0,
      });
    }

    return result;
  }

  // Get recent activities
  async getRecentActivities(limit = 10) {
    const activities = [];

    // Get recent stories
    const recentStories = await db.Story.findAll({
      limit: limit,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: db.User,
          as: "author",
          attributes: ["id", "username", "first_name", "last_name"],
        },
      ],
    });

    recentStories.forEach((story) => {
      activities.push({
        id: `story-${story.id}`,
        type: "ストーリー投稿",
        type_en: "story_post",
        user: story.author
          ? story.author.username ||
            `${story.author.first_name} ${story.author.last_name}`
          : "Unknown",
        user_id: story.user_id,
        details: story.title || story.content?.substring(0, 50) + "...",
        content_id: story.id,
        time: story.created_at,
        status: "✓ 承認済み",
        status_color: "green",
      });
    });

    // Get recent documents
    const recentDocuments = await db.Document.findAll({
      limit: limit,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: db.User,
          as: "uploader",
          attributes: ["id", "username", "first_name", "last_name"],
        },
      ],
    });

    recentDocuments.forEach((doc) => {
      activities.push({
        id: `doc-${doc.id}`,
        type: "ドキュメント共有",
        type_en: "document_share",
        user: doc.uploader
          ? doc.uploader.username ||
            `${doc.uploader.first_name} ${doc.uploader.last_name}`
          : "Unknown",
        user_id: doc.user_id,
        details: doc.title || doc.file_name,
        content_id: doc.id,
        time: doc.created_at,
        status: "✓ 承認済み",
        status_color: "green",
      });
    });

    // Get recent topics
    const recentTopics = await db.Topic.findAll({
      limit: limit,
      order: [["created_at", "DESC"]],
    });

    recentTopics.forEach((topic) => {
      activities.push({
        id: `topic-${topic.id}`,
        type: "トピック作成",
        type_en: "topic_creation",
        user: "管理者", // Topic creation is typically by admin
        user_id: null,
        details: topic.name,
        content_id: topic.id,
        time: topic.created_at,
        status: "活動中",
        status_color: "blue",
      });
    });

    // Get recent comments
    const recentComments = await db.Comment.findAll({
      limit: limit,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: db.User,
          as: "author",
          attributes: ["id", "username", "first_name", "last_name"],
        },
        {
          model: db.Story,
          as: "story",
          attributes: ["id", "title"],
          required: false,
        },
      ],
    });

    recentComments.forEach((comment) => {
      activities.push({
        id: `comment-${comment.id}`,
        type: "コメント投稿",
        type_en: "comment_post",
        user: comment.author
          ? comment.author.username ||
            `${comment.author.first_name} ${comment.author.last_name}`
          : "Unknown",
        user_id: comment.user_id,
        details: comment.story
          ? `ストーリーへのコメント追加`
          : comment.content?.substring(0, 50) + "...",
        content_id: comment.story_id || comment.id,
        time: comment.created_at,
        status: "✓ 承認済み",
        status_color: "green",
      });
    });

    // Sort all activities by time (newest first) and limit
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    return activities.slice(0, limit);
  }

  // Get all users with pagination and filtering
  async getUsers(query = {}) {
    const page = parseInt(query.page) || 1;
    const perPage = parseInt(query.per_page) || 20;
    const offset = (page - 1) * perPage;
    const { role, status, search } = query;

    const where = {};

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await db.User.findAndCountAll({
      where,
      attributes: {
        exclude: ["password"],
      },
      include: [
        {
          model: db.Department,
          as: "department",
          attributes: ["id", "name"],
          required: false,
        },
      ],
      order: [["created_at", "DESC"]],
      limit: perPage,
      offset,
    });

    const users = rows.map((user) => {
      const userJson = user.toJSON();
      return {
        ...userJson,
        full_name: `${userJson.first_name} ${userJson.last_name}`.trim(),
      };
    });

    const pagination = getPaginationMeta(count, page, perPage);

    return {
      users,
      pagination,
    };
  }

  // Get user by ID
  async getUserById(userId) {
    const user = await db.User.findByPk(userId, {
      attributes: {
        exclude: ["password"],
      },
      include: [
        {
          model: db.Department,
          as: "department",
          attributes: ["id", "name"],
          required: false,
        },
      ],
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const userJson = user.toJSON();
    return {
      ...userJson,
      full_name: `${userJson.first_name} ${userJson.last_name}`.trim(),
    };
  }

  // Update user
  async updateUser(userId, updateData) {
    const user = await db.User.findByPk(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Allowed fields to update
    const allowedFields = [
      "first_name",
      "last_name",
      "email",
      "role",
      "status",
      "department_id",
      "bio",
      "current_job",
      "work_experience",
      "specialization",
    ];

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        user[field] = updateData[field];
      }
    });

    await user.save();

    const userJson = user.toJSON();
    delete userJson.password;
    return {
      ...userJson,
      full_name: `${userJson.first_name} ${userJson.last_name}`.trim(),
    };
  }

  // Suspend/Activate user
  async toggleUserStatus(userId) {
    const user = await db.User.findByPk(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    user.status = user.status === "active" ? "inactive" : "active";
    await user.save();

    const userJson = user.toJSON();
    delete userJson.password;
    return {
      ...userJson,
      full_name: `${userJson.first_name} ${userJson.last_name}`.trim(),
    };
  }

  // Delete user (soft delete)
  async deleteUser(userId) {
    const user = await db.User.findByPk(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    await user.destroy();
    return { message: "User deleted successfully" };
  }

  // Get all topics with pagination and statistics
  async getTopics(query = {}) {
    const page = parseInt(query.page) || 1;
    const perPage = parseInt(query.per_page) || 20;
    const offset = (page - 1) * perPage;
    const { search } = query;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await db.Topic.findAndCountAll({
      where,
      include: [
        {
          model: db.Category,
          as: "category",
          attributes: ["id", "name"],
        },
        {
          model: db.User,
          as: "creator",
          attributes: ["id", "first_name", "last_name", "username"],
        },
      ],
      order: [
        ["is_pinned", "DESC"],
        ["created_at", "DESC"],
      ],
      limit: perPage,
      offset,
    });

    // Get story count and comment count for each topic
    const topics = await Promise.all(
      rows.map(async (topic) => {
        const storyCount = await db.Story.count({
          where: { topic_id: topic.id },
        });

        // Get all story IDs for this topic
        const stories = await db.Story.findAll({
          where: { topic_id: topic.id },
          attributes: ["id"],
          raw: true,
        });
        const storyIds = stories.map((s) => s.id);

        // Count comments for all stories in this topic
        const commentCount =
          storyIds.length > 0
            ? await db.Comment.count({
                where: { story_id: { [Op.in]: storyIds } },
              })
            : 0;

        const topicJson = topic.toJSON();
        return {
          ...topicJson,
          story_count: storyCount,
          comment_count: commentCount,
        };
      })
    );

    const pagination = getPaginationMeta(count, page, perPage);

    return {
      topics,
      pagination,
    };
  }

  // Get topic by ID
  async getTopicById(topicId) {
    const topic = await db.Topic.findByPk(topicId, {
      include: [
        {
          model: db.Category,
          as: "category",
          attributes: ["id", "name"],
        },
        {
          model: db.User,
          as: "creator",
          attributes: ["id", "first_name", "last_name", "username"],
        },
      ],
    });

    if (!topic) {
      throw new NotFoundError("Topic not found");
    }

    const storyCount = await db.Story.count({
      where: { topic_id: topic.id },
    });

    // Get all story IDs for this topic
    const stories = await db.Story.findAll({
      where: { topic_id: topic.id },
      attributes: ["id"],
      raw: true,
    });
    const storyIds = stories.map((s) => s.id);

    // Count comments for all stories in this topic
    const commentCount =
      storyIds.length > 0
        ? await db.Comment.count({
            where: { story_id: { [Op.in]: storyIds } },
          })
        : 0;

    const topicJson = topic.toJSON();
    return {
      ...topicJson,
      story_count: storyCount,
      comment_count: commentCount,
    };
  }

  // Get all categories (for dropdown)
  async getCategories() {
    const categories = await db.Category.findAll({
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });
    return { categories };
  }

  // Create topic
  async createTopic(userId, topicData) {
    const { name, description, category_id, is_pinned } = topicData;

    // Check if category exists
    const category = await db.Category.findByPk(category_id);
    if (!category) {
      throw new NotFoundError("Category not found");
    }

    const topic = await db.Topic.create({
      name,
      description,
      category_id,
      created_by: userId,
      is_pinned: is_pinned || false,
    });

    const createdTopic = await db.Topic.findByPk(topic.id, {
      include: [
        {
          model: db.Category,
          as: "category",
          attributes: ["id", "name"],
        },
        {
          model: db.User,
          as: "creator",
          attributes: ["id", "first_name", "last_name", "username"],
        },
      ],
    });

    return createdTopic.toJSON();
  }

  // Update topic
  async updateTopic(topicId, topicData) {
    const topic = await db.Topic.findByPk(topicId);
    if (!topic) {
      throw new NotFoundError("Topic not found");
    }

    const { name, description, category_id, is_pinned } = topicData;

    if (category_id) {
      const category = await db.Category.findByPk(category_id);
      if (!category) {
        throw new NotFoundError("Category not found");
      }
    }

    await topic.update({
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(category_id !== undefined && { category_id }),
      ...(is_pinned !== undefined && { is_pinned }),
    });

    const updatedTopic = await db.Topic.findByPk(topicId, {
      include: [
        {
          model: db.Category,
          as: "category",
          attributes: ["id", "name"],
        },
        {
          model: db.User,
          as: "creator",
          attributes: ["id", "first_name", "last_name", "username"],
        },
      ],
    });

    return updatedTopic.toJSON();
  }

  // Delete topic (soft delete)
  async deleteTopic(topicId) {
    const topic = await db.Topic.findByPk(topicId);
    if (!topic) {
      throw new NotFoundError("Topic not found");
    }

    await topic.destroy();
    return { message: "Topic deleted successfully" };
  }

  // Toggle pin topic
  async togglePinTopic(topicId) {
    const topic = await db.Topic.findByPk(topicId);
    if (!topic) {
      throw new NotFoundError("Topic not found");
    }

    await topic.update({ is_pinned: !topic.is_pinned });
    return { is_pinned: !topic.is_pinned };
  }

  // Get stories by date (for dashboard)
  async getStoriesByDate(date) {
    // Parse date string (YYYY-MM-DD) and create date range
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const stories = await db.Story.findAll({
      where: {
        created_at: {
          [Op.between]: [startDate, endDate],
        },
      },
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
      order: [["created_at", "DESC"]],
    });

    // Get comment count and reactions count for each story
    const storiesWithCounts = await Promise.all(
      stories.map(async (story) => {
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

        // Parse image_url if it's a JSON string
        if (storyJson.image_url) {
          try {
            const parsed = JSON.parse(storyJson.image_url);
            if (Array.isArray(parsed)) {
              storyJson.image_urls = parsed;
              storyJson.image_url = parsed[0] || null;
            }
          } catch (e) {
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

    return storiesWithCounts;
  }

  // Delete story (admin can delete any story)
  async deleteStory(storyId) {
    const story = await db.Story.findByPk(storyId);
    if (!story) {
      throw new NotFoundError("Story not found");
    }

    await story.destroy();
    return { message: "Story deleted successfully" };
  }
}

module.exports = new AdminService();
