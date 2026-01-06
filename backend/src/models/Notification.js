"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      // User who receives the notification
      Notification.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "recipient",
      });

      // User who triggered the notification
      Notification.belongsTo(models.User, {
        foreignKey: "actor_id",
        as: "actor",
      });
    }
  }

  Notification.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      actor_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM(
          "comment_on_story",
          "reaction_on_story",
          "user_posted_story",
          "user_posted_document",
          "user_saved_document",
          "admin_created_topic"
        ),
        allowNull: false,
      },
      entity_type: {
        type: DataTypes.ENUM("story", "comment", "document", "topic"),
        allowNull: false,
      },
      entity_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Notification",
      tableName: "notifications",
      underscored: true,
      paranoid: true,
    }
  );

  return Notification;
};
