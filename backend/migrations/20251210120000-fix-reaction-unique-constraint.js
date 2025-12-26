"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if old unique constraint exists and remove it
    try {
      await queryInterface.removeIndex("reactions", "unique_reaction");
    } catch (error) {
      console.log("Index 'unique_reaction' does not exist, skipping removal");
    }

    // Check and drop existing partial index if exists
    try {
      await queryInterface.sequelize.query(`
        DROP INDEX unique_reaction_active ON reactions;
      `);
    } catch (error) {
      console.log(
        "Index 'unique_reaction_active' does not exist, proceeding with creation"
      );
    }

    // Add new partial unique index that only applies to non-deleted records
    // Note: MySQL doesn't support partial indexes natively like PostgreSQL
    // We'll use a workaround with a functional index or handle in application logic
    // For now, we'll create a regular unique index and rely on application logic
    await queryInterface.addIndex(
      "reactions",
      ["user_id", "target_type", "target_id", "deleted_at"],
      {
        unique: true,
        name: "unique_reaction_with_deleted",
      }
    );
  },

  async down(queryInterface, Sequelize) {
    // Remove new unique index
    try {
      await queryInterface.removeIndex(
        "reactions",
        "unique_reaction_with_deleted"
      );
    } catch (error) {
      console.log("Index removal failed, may not exist");
    }

    // Restore old unique constraint
    await queryInterface.addIndex(
      "reactions",
      ["user_id", "target_type", "target_id"],
      {
        unique: true,
        name: "unique_reaction",
      }
    );
  },
};
