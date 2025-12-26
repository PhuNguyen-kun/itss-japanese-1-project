"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Story extends Model {
    static associate(models) {
      Story.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "author",
      });

      Story.belongsTo(models.Topic, {
        foreignKey: "topic_id",
        as: "topic",
      });

      Story.hasMany(models.Comment, {
        foreignKey: "story_id",
        as: "comments",
      });

      Story.hasMany(models.Reaction, {
        foreignKey: "target_id",
        constraints: false,
        scope: {
          target_type: "story",
        },
        as: "reactions",
      });

      Story.hasMany(models.SavedStory, {
        foreignKey: "story_id",
        as: "saved_by",
      });
    }
  }

  Story.init(
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
      topic_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      image_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      view_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      like_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      comment_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "Story",
      tableName: "stories",
      underscored: true,
      paranoid: true,
    }
  );

  return Story;
};
