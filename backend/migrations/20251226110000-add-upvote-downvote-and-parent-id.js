"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Step 1: Modify reaction_type enum to include upvote and downvote (MySQL)
    await queryInterface.sequelize.query(`
      ALTER TABLE reactions 
      MODIFY COLUMN reaction_type ENUM('like', 'love', 'haha', 'support', 'sad', 'upvote', 'downvote') NOT NULL;
    `);

    // Step 2: Add parent_id to comments table for nested replies
    await queryInterface.addColumn("comments", "parent_id", {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: "comments",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    // Add index for parent_id
    await queryInterface.addIndex("comments", ["parent_id"]);
  },

  async down(queryInterface, Sequelize) {
    // Remove parent_id column
    await queryInterface.removeColumn("comments", "parent_id");

    // Revert reaction_type enum to original values
    await queryInterface.sequelize.query(`
      ALTER TABLE reactions 
      MODIFY COLUMN reaction_type ENUM('like', 'love', 'haha', 'support', 'sad') NOT NULL;
    `);
  },
};
