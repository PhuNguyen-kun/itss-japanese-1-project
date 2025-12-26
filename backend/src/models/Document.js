"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Document extends Model {
    static associate(models) {
      Document.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "uploader",
      });

      Document.belongsTo(models.Category, {
        foreignKey: "category_id",
        as: "category",
      });

      Document.hasMany(models.SavedDocument, {
        foreignKey: "document_id",
        as: "savedBy",
      });

      Document.hasMany(models.Reaction, {
        foreignKey: "target_id",
        constraints: false,
        scope: {
          target_type: "document",
        },
        as: "reactions",
      });
    }
  }

  Document.init(
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
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      file_url: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      file_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      file_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      file_size: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Document",
      tableName: "documents",
      underscored: true,
      timestamps: true,
    }
  );

  return Document;
};
