"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Follow extends Model {
    static associate(models) {
      // User who is following
      Follow.belongsTo(models.User, {
        foreignKey: "follower_id",
        as: "follower",
      });

      // User being followed
      Follow.belongsTo(models.User, {
        foreignKey: "following_id",
        as: "following",
      });
    }
  }

  Follow.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      follower_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      following_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Follow",
      tableName: "follows",
      underscored: true,
      paranoid: false, // Disable soft delete for follows to avoid unique constraint issues
    }
  );

  return Follow;
};

