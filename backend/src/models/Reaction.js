"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Reaction extends Model {
    static associate(models) {
      Reaction.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });

      // Polymorphic associations
      Reaction.belongsTo(models.Story, {
        foreignKey: "target_id",
        constraints: false,
        scope: {
          target_type: "story",
        },
        as: "story",
      });

      Reaction.belongsTo(models.Comment, {
        foreignKey: "target_id",
        constraints: false,
        scope: {
          target_type: "comment",
        },
        as: "comment",
      });
    }
  }

  Reaction.init(
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
      target_type: {
        type: DataTypes.ENUM("story", "comment"),
        allowNull: false,
      },
      target_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      reaction_type: {
        type: DataTypes.ENUM("like", "love", "haha", "support", "sad", "upvote", "downvote"),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Reaction",
      tableName: "reactions",
      underscored: true,
      paranoid: true,
      indexes: [
        {
          unique: true,
          fields: ["user_id", "target_type", "target_id"],
          name: "unique_reaction",
        },
      ],
    }
  );

  return Reaction;
};

