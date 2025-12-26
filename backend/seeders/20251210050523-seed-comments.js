"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get user IDs and story IDs
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role = 'teacher' LIMIT 2`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const stories = await queryInterface.sequelize.query(
      `SELECT id FROM stories ORDER BY created_at DESC LIMIT 3`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (users.length === 0 || stories.length === 0) {
      console.log("No users or stories found, skipping comments seed");
      return;
    }

    const teacher1Id = users[0].id;
    const teacher2Id = users[1]?.id || users[0].id;
    const story1Id = stories[0].id;
    const story2Id = stories[1]?.id || stories[0].id;
    const story3Id = stories[2]?.id || stories[0].id;

    return queryInterface.bulkInsert("comments", [
      {
        story_id: story1Id,
        user_id: teacher2Id,
        content: "とても参考になります！ありがとうございます。",
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000),
        deleted_at: null,
      },
      {
        story_id: story1Id,
        user_id: teacher1Id,
        content: "私も同じ経験があります。",
        created_at: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        updated_at: new Date(Date.now() - 30 * 60 * 1000),
        deleted_at: null,
      },
      {
        story_id: story2Id,
        user_id: teacher1Id,
        content: "素晴らしいアイデアですね！",
        created_at: new Date(Date.now() - 19 * 60 * 60 * 1000), // 19 hours ago
        updated_at: new Date(Date.now() - 19 * 60 * 60 * 1000),
        deleted_at: null,
      },
      {
        story_id: story3Id,
        user_id: teacher2Id,
        content: "私も試してみます！",
        created_at: new Date(Date.now() - 23 * 60 * 60 * 1000), // 23 hours ago
        updated_at: new Date(Date.now() - 23 * 60 * 60 * 1000),
        deleted_at: null,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("comments", null, {});
  },
};

