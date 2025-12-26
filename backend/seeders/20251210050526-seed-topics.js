"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get category IDs and user IDs
    const categories = await queryInterface.sequelize.query(
      `SELECT id FROM categories ORDER BY id LIMIT 4`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role = 'teacher' OR role = 'admin' LIMIT 2`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (categories.length === 0 || users.length === 0) {
      console.log("No categories or users found, skipping topics seed");
      return;
    }

    const category1Id = categories[0].id;
    const category2Id = categories[1]?.id || categories[0].id;
    const userId = users[0].id;

    return queryInterface.bulkInsert("topics", [
      {
        category_id: category1Id,
        created_by: userId,
        name: "学生の集中力向上",
        description: "学生の集中力を向上させるための方法について議論します",
        is_pinned: false,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        category_id: category2Id,
        created_by: userId,
        name: "効果的な宿題の出し方",
        description: "学生の学習効果を高める宿題の出し方について",
        is_pinned: false,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        category_id: category1Id,
        created_by: userId,
        name: "オンライン授業のコツ",
        description: "オンライン授業を効果的に行うためのコツを共有します",
        is_pinned: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("topics", null, {});
  },
};
