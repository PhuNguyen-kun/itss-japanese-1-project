"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get user IDs from users table
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role = 'teacher' LIMIT 2`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Get topic IDs
    const topics = await queryInterface.sequelize.query(
      `SELECT id FROM topics ORDER BY created_at DESC LIMIT 3`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (users.length === 0) {
      console.log("No teachers found, skipping stories seed");
      return;
    }

    const teacher1Id = users[0].id;
    const teacher2Id = users[1]?.id || users[0].id;
    const topic1Id = topics[0]?.id || null;
    const topic2Id = topics[1]?.id || null;
    const topic3Id = topics[2]?.id || null;

    return queryInterface.bulkInsert("stories", [
      {
        user_id: teacher1Id,
        topic_id: topic1Id,
        title: "新しいストーリー",
        content: "アクティビティの説明をここに記入します...",
        view_count: 10,
        like_count: 5,
        comment_count: 2,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
        deleted_at: null,
      },
      {
        user_id: teacher2Id,
        topic_id: topic2Id,
        title: "教育方法の共有",
        content: "アクティビティの説明をここに記入します...",
        view_count: 15,
        like_count: 8,
        comment_count: 3,
        created_at: new Date(Date.now() - 20 * 60 * 60 * 1000), // 20 hours ago
        updated_at: new Date(Date.now() - 20 * 60 * 60 * 1000),
        deleted_at: null,
      },
      {
        user_id: teacher1Id,
        topic_id: topic3Id,
        title: "学生の集中力向上について",
        content: "最近、学生の集中力が向上していると感じています。皆さんはどのような方法を使っていますか？",
        view_count: 25,
        like_count: 12,
        comment_count: 5,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000),
        deleted_at: null,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("stories", null, {});
  },
};
