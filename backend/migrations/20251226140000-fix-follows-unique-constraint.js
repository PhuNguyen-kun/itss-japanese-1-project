"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove old unique index with WHERE clause (may not work in all MySQL versions)
    try {
      await queryInterface.removeIndex("follows", "unique_follow");
    } catch (error) {
      // Index might not exist or have different name
      console.log("Index unique_follow not found or already removed");
    }

    // Delete any soft-deleted records (cleanup)
    await queryInterface.sequelize.query(
      `DELETE FROM follows WHERE deleted_at IS NOT NULL`
    );

    // Add simple unique constraint (without WHERE clause)
    await queryInterface.addIndex("follows", ["follower_id", "following_id"], {
      unique: true,
      name: "unique_follow",
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the simple unique constraint
    try {
      await queryInterface.removeIndex("follows", "unique_follow");
    } catch (error) {
      console.log("Index unique_follow not found");
    }

    // Restore the partial unique index (if needed)
    // Note: This may not work in all MySQL versions
    try {
      await queryInterface.addIndex("follows", ["follower_id", "following_id"], {
        unique: true,
        name: "unique_follow",
        where: {
          deleted_at: null,
        },
      });
    } catch (error) {
      console.log("Could not restore partial unique index:", error.message);
    }
  },
};

