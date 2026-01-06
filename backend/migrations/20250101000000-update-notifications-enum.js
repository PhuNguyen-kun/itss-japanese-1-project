"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Update type ENUM to include new notification types
    await queryInterface.sequelize.query(`
      ALTER TABLE notifications 
      MODIFY COLUMN type ENUM(
        'comment_on_story', 
        'reaction_on_story',
        'user_posted_story',
        'user_posted_document',
        'user_saved_document',
        'admin_created_topic'
      ) NOT NULL;
    `);

    // Update entity_type ENUM to include 'document' and 'topic'
    await queryInterface.sequelize.query(`
      ALTER TABLE notifications 
      MODIFY COLUMN entity_type ENUM(
        'story', 
        'comment',
        'document',
        'topic'
      ) NOT NULL;
    `);
  },

  async down(queryInterface, Sequelize) {
    // Revert to original ENUM values
    await queryInterface.sequelize.query(`
      ALTER TABLE notifications 
      MODIFY COLUMN type ENUM(
        'comment_on_story', 
        'reaction_on_story',
        'user_posted_story',
        'user_posted_document',
        'user_saved_document',
        'admin_created_topic'
      ) NOT NULL;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE notifications 
      MODIFY COLUMN entity_type ENUM(
        'story', 
        'comment'
      ) NOT NULL;
    `);
  },
};
