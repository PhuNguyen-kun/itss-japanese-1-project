const db = require("../models");
const { BadRequestError, NotFoundError } = require("../utils/ApiError");

class SavedStoryService {
  async saveStory(userId, storyId) {
    // Check if story exists
    const story = await db.Story.findByPk(storyId);
    if (!story) {
      throw new NotFoundError("Story not found");
    }

    // Check if already saved
    const existingSave = await db.SavedStory.findOne({
      where: { user_id: userId, story_id: storyId },
    });

    if (existingSave) {
      throw new BadRequestError("Story already saved");
    }

    // Create save
    const savedStory = await db.SavedStory.create({
      user_id: userId,
      story_id: storyId,
    });

    return savedStory;
  }

  async unsaveStory(userId, storyId) {
    const savedStory = await db.SavedStory.findOne({
      where: { user_id: userId, story_id: storyId },
    });

    if (!savedStory) {
      throw new NotFoundError("Saved story not found");
    }

    await savedStory.destroy();

    return { message: "Story unsaved successfully" };
  }

  async getSavedStories(userId, query = {}) {
    const page = parseInt(query.page) || 1;
    const perPage = parseInt(query.per_page) || 20;
    const offset = (page - 1) * perPage;

    const { count, rows } = await db.SavedStory.findAndCountAll({
      where: { user_id: userId },
      include: [
        {
          model: db.Story,
          as: "story",
          include: [
            {
              model: db.User,
              as: "author",
              attributes: ["id", "first_name", "last_name", "username", "avatar_url"],
            },
            {
              model: db.Topic,
              as: "topic",
              attributes: ["id", "name"],
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
        },
      ],
      order: [["created_at", "DESC"]],
      limit: perPage,
      offset,
      distinct: true,
    });

    // Process stories to parse image_urls and add counts
    const processedSavedStories = await Promise.all(
      rows.map(async (savedStory) => {
        const story = savedStory.story;
        if (!story) return savedStory;

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

        return {
          ...savedStory.toJSON(),
          story: {
            ...storyJson,
            comment_count: commentCount,
            reactions_count: reactionsCount,
          },
        };
      })
    );

    return {
      saved_stories: processedSavedStories,
      pagination: {
        total: count,
        page,
        per_page: perPage,
        total_pages: Math.ceil(count / perPage),
      },
    };
  }

  async checkIfSaved(userId, storyId) {
    const savedStory = await db.SavedStory.findOne({
      where: { user_id: userId, story_id: storyId },
    });

    return { is_saved: !!savedStory };
  }
}

module.exports = new SavedStoryService();

