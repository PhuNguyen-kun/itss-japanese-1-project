"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("stories", "image_url", {
      type: Sequelize.STRING(500),
      allowNull: true,
      after: "content",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("stories", "image_url");
  },
};
