"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("saved_stories", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      story_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "stories",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Add unique constraint to prevent duplicate saves
    await queryInterface.addIndex("saved_stories", ["user_id", "story_id"], {
      unique: true,
      name: "unique_saved_story",
    });

    // Add indexes for better query performance
    await queryInterface.addIndex("saved_stories", ["user_id"]);
    await queryInterface.addIndex("saved_stories", ["story_id"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("saved_stories");
  },
};

