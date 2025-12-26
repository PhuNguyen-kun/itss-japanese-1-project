"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("users", "bio", {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: "User biography/self-introduction",
    });

    await queryInterface.addColumn("users", "current_job", {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "Current job/workplace",
    });

    await queryInterface.addColumn("users", "work_experience", {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: "Previous work experience",
    });

    await queryInterface.addColumn("users", "specialization", {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "Area of specialization/expertise",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("users", "bio");
    await queryInterface.removeColumn("users", "current_job");
    await queryInterface.removeColumn("users", "work_experience");
    await queryInterface.removeColumn("users", "specialization");
  },
};

