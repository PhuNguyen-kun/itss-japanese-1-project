"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Topic extends Model {
    static associate(models) {
      Topic.belongsTo(models.Category, {
        foreignKey: "category_id",
        as: "category",
      });

      Topic.belongsTo(models.User, {
        foreignKey: "created_by",
        as: "creator",
      });

      Topic.hasMany(models.Story, {
        foreignKey: "topic_id",
        as: "stories",
      });
    }
  }

  Topic.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      created_by: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_pinned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Topic",
      tableName: "topics",
      underscored: true,
      paranoid: true,
    }
  );

  return Topic;
};

