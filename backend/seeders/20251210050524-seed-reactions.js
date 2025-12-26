"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get user IDs and story IDs
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role = 'teacher' LIMIT 2`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const stories = await queryInterface.sequelize.query(
      `SELECT id FROM stories ORDER BY created_at DESC LIMIT 3`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const comments = await queryInterface.sequelize.query(
      `SELECT id FROM comments ORDER BY created_at DESC LIMIT 2`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (users.length === 0 || stories.length === 0) {
      console.log("No users or stories found, skipping reactions seed");
      return;
    }

    const teacher1Id = users[0].id;
    const teacher2Id = users[1]?.id || users[0].id;
    const story1Id = stories[0].id;
    const story2Id = stories[1]?.id || stories[0].id;
    const comment1Id = comments[0]?.id;

    const reactionsToInsert = [];
    
    // Story reactions - only add if users are different
    if (teacher1Id !== teacher2Id) {
      reactionsToInsert.push({
        user_id: teacher1Id,
        target_type: "story",
        target_id: story1Id,
        reaction_type: "like",
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000),
        deleted_at: null,
      });
      
      reactionsToInsert.push({
        user_id: teacher2Id,
        target_type: "story",
        target_id: story1Id,
        reaction_type: "love",
        created_at: new Date(Date.now() - 50 * 60 * 1000),
        updated_at: new Date(Date.now() - 50 * 60 * 1000),
        deleted_at: null,
      });
    } else {
      // If same user, only add one reaction
      reactionsToInsert.push({
        user_id: teacher1Id,
        target_type: "story",
        target_id: story1Id,
        reaction_type: "like",
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000),
        deleted_at: null,
      });
    }

    // Only add story2 reaction if story2 exists and is different from story1
    if (story2Id && story2Id !== story1Id) {
      reactionsToInsert.push({
        user_id: teacher1Id,
        target_type: "story",
        target_id: story2Id,
        reaction_type: "support",
        created_at: new Date(Date.now() - 19 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 19 * 60 * 60 * 1000),
        deleted_at: null,
      });
    }

    // Comment reactions (if comments exist)
    if (comment1Id) {
      reactionsToInsert.push({
        user_id: teacher1Id,
        target_type: "comment",
        target_id: comment1Id,
        reaction_type: "like",
        created_at: new Date(Date.now() - 30 * 60 * 1000),
        updated_at: new Date(Date.now() - 30 * 60 * 1000),
        deleted_at: null,
      });
    }

    if (reactionsToInsert.length === 0) {
      console.log("No reactions to insert");
      return;
    }

    return queryInterface.bulkInsert("reactions", reactionsToInsert);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("reactions", null, {});
  },
};
