const db = require("../models");

class TopicService {
  async getAll() {
    const topics = await db.Topic.findAll({
      attributes: ["id", "name", "description"],
      order: [["name", "ASC"]],
    });
    return { topics };
  }

  async getTrending(query = {}) {
    const limit = parseInt(query.limit) || 5;

    // Get topics with aggregated engagement from their stories
    const topics = await db.Topic.findAll({
      attributes: [
        "id",
        "name",
        "description",
        [
          db.sequelize.literal(
            "(SELECT COUNT(*) FROM stories WHERE stories.topic_id = Topic.id AND stories.deleted_at IS NULL)"
          ),
          "story_count",
        ],
        [
          db.sequelize.literal(
            `(SELECT COALESCE(SUM(
              comment_count + 
              (SELECT COUNT(*) FROM reactions WHERE reactions.target_type = 'story' AND reactions.target_id = stories.id AND reactions.deleted_at IS NULL)
            ), 0) FROM stories WHERE stories.topic_id = Topic.id AND stories.deleted_at IS NULL)`
          ),
          "total_engagement",
        ],
      ],
      order: [[db.sequelize.literal("total_engagement"), "DESC"]],
      limit,
      subQuery: false,
    });

    return topics;
  }
}

module.exports = new TopicService();
