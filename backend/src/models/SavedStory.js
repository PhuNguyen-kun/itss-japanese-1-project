"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class SavedStory extends Model {
    static associate(models) {
      SavedStory.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });

      SavedStory.belongsTo(models.Story, {
        foreignKey: "story_id",
        as: "story",
      });
    }
  }

  SavedStory.init(
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
      story_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "SavedStory",
      tableName: "saved_stories",
      underscored: true,
      timestamps: true,
    }
  );

  return SavedStory;
};

