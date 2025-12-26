"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("categories", [
      {
        name: "教育方法",
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        name: "学生管理",
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        name: "教材共有",
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        name: "その他",
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("categories", null, {});
  },
};
