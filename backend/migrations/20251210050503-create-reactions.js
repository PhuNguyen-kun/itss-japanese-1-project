"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("reactions", {
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
      target_type: {
        type: Sequelize.ENUM("story", "comment"),
        allowNull: false,
      },
      target_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      reaction_type: {
        type: Sequelize.ENUM("like", "love", "haha", "support", "sad"),
        allowNull: false,
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
      deleted_at: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    });

    // Add unique constraint to prevent duplicate reactions
    await queryInterface.addIndex("reactions", ["user_id", "target_type", "target_id"], {
      unique: true,
      name: "unique_reaction",
    });

    // Add indexes for better query performance
    await queryInterface.addIndex("reactions", ["target_type", "target_id"]);
    await queryInterface.addIndex("reactions", ["user_id"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("reactions");
  },
};
