"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    static associate(models) {
      Comment.belongsTo(models.Story, {
        foreignKey: "story_id",
        as: "story",
      });

      Comment.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "author",
      });

      Comment.hasMany(models.Reaction, {
        foreignKey: "target_id",
        constraints: false,
        scope: {
          target_type: "comment",
        },
        as: "reactions",
      });

      // Self-referencing for nested replies
      Comment.belongsTo(models.Comment, {
        foreignKey: "parent_id",
        as: "parent",
      });

      Comment.hasMany(models.Comment, {
        foreignKey: "parent_id",
        as: "replies",
      });
    }
  }

  Comment.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      story_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      parent_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Comment",
      tableName: "comments",
      underscored: true,
      paranoid: true,
    }
  );

  return Comment;
};

