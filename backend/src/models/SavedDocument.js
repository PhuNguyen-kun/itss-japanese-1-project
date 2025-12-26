"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class SavedDocument extends Model {
    static associate(models) {
      SavedDocument.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });

      SavedDocument.belongsTo(models.Document, {
        foreignKey: "document_id",
        as: "document",
      });
    }
  }

  SavedDocument.init(
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
      document_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "SavedDocument",
      tableName: "saved_documents",
      underscored: true,
      timestamps: true,
    }
  );

  return SavedDocument;
};
