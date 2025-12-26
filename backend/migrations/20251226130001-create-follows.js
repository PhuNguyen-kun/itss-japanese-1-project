"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("follows", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      follower_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: "User who is following",
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      following_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: "User being followed",
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Add unique constraint to prevent duplicate follows
    await queryInterface.addIndex("follows", ["follower_id", "following_id"], {
      unique: true,
      name: "unique_follow",
      where: {
        deleted_at: null,
      },
    });

    // Add indexes for performance
    await queryInterface.addIndex("follows", ["follower_id"]);
    await queryInterface.addIndex("follows", ["following_id"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("follows");
  },
};

