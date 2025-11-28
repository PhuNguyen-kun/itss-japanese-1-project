"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove full_name column
    await queryInterface.removeColumn("users", "full_name");

    // Add first_name column
    await queryInterface.addColumn("users", "first_name", {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: "",
      after: "password",
    });

    // Add last_name column
    await queryInterface.addColumn("users", "last_name", {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: "",
      after: "first_name",
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove first_name and last_name columns
    await queryInterface.removeColumn("users", "first_name");
    await queryInterface.removeColumn("users", "last_name");

    // Add back full_name column
    await queryInterface.addColumn("users", "full_name", {
      type: Sequelize.STRING(100),
      allowNull: false,
      after: "password",
    });
  },
};
