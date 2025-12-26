const db = require("../models");
const { NotFoundError, ForbiddenError } = require("../utils/ApiError");
const {
  getPaginationParams,
  getPaginationMeta,
} = require("../utils/pagination");
const { Op } = require("sequelize");

class DocumentService {
  async uploadDocument(userId, data, file) {
    const fileUrl = `/uploads/documents/${file.filename}`;
    const fileType = file.originalname.split(".").pop().toLowerCase();

    const document = await db.Document.create({
      user_id: userId,
      title: data.title,
      description: data.description || null,
      category_id: data.category_id || null,
      file_url: fileUrl,
      file_name: file.originalname,
      file_type: fileType,
      file_size: file.size,
    });

    return this.getDocumentById(document.id);
  }

  async getDocuments(query = {}) {
    const { page, per_page, offset } = getPaginationParams(query);
    const { search, category_id } = query;

    const where = {};

    if (search) {
      where.title = {
        [Op.like]: `%${search}%`,
      };
    }

    if (category_id) {
      where.category_id = category_id;
    }

    const { count, rows } = await db.Document.findAndCountAll({
      where,
      include: [
        {
          model: db.User,
          as: "uploader",
          attributes: ["id", "first_name", "last_name", "username", "email", "avatar_url"],
        },
        {
          model: db.Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: per_page,
      offset,
    });

    // Get saved count for each document
    const documentsWithCounts = await Promise.all(
      rows.map(async (document) => {
        const savedCount = await db.SavedDocument.count({
          where: { document_id: document.id },
        });
        return {
          ...document.toJSON(),
          saved_count: savedCount,
        };
      })
    );

    const pagination = getPaginationMeta(count, page, per_page);

    return { documents: documentsWithCounts, pagination };
  }

  async getMyDocuments(userId, query = {}) {
    const { page, per_page, offset } = getPaginationParams(query);
    const { search, category_id } = query;

    const where = { user_id: userId };

    if (search) {
      where.title = {
        [Op.like]: `%${search}%`,
      };
    }

    if (category_id) {
      where.category_id = category_id;
    }

    const { count, rows } = await db.Document.findAndCountAll({
      where,
      include: [
        {
          model: db.User,
          as: "uploader",
          attributes: ["id", "first_name", "last_name", "username", "email", "avatar_url"],
        },
        {
          model: db.Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: per_page,
      offset,
    });

    // Get saved count for each document
    const documentsWithCounts = await Promise.all(
      rows.map(async (document) => {
        const savedCount = await db.SavedDocument.count({
          where: { document_id: document.id },
        });
        return {
          ...document.toJSON(),
          saved_count: savedCount,
        };
      })
    );

    const pagination = getPaginationMeta(count, page, per_page);

    return { documents: documentsWithCounts, pagination };
  }

  async getDocumentById(documentId) {
    const document = await db.Document.findByPk(documentId, {
      include: [
        {
          model: db.User,
          as: "uploader",
          attributes: ["id", "first_name", "last_name", "username", "email", "avatar_url"],
        },
        {
          model: db.Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!document) {
      throw new NotFoundError("Document not found");
    }

    return document;
  }

  async deleteDocument(documentId, userId) {
    const document = await db.Document.findByPk(documentId);

    if (!document) {
      throw new NotFoundError("Document not found");
    }

    if (document.user_id !== userId) {
      throw new ForbiddenError("You can only delete your own documents");
    }

    await document.destroy();
  }

  async saveDocument(documentId, userId) {
    const document = await db.Document.findByPk(documentId);

    if (!document) {
      throw new NotFoundError("Document not found");
    }

    const existing = await db.SavedDocument.findOne({
      where: { user_id: userId, document_id: documentId },
    });

    if (existing) {
      return existing;
    }

    const saved = await db.SavedDocument.create({
      user_id: userId,
      document_id: documentId,
    });

    return saved;
  }

  async unsaveDocument(documentId, userId) {
    const saved = await db.SavedDocument.findOne({
      where: { user_id: userId, document_id: documentId },
    });

    if (!saved) {
      throw new NotFoundError("Saved document not found");
    }

    await saved.destroy();
  }

  async getSavedDocuments(userId, query = {}) {
    const { page, per_page, offset } = getPaginationParams(query);
    const { search, category_id } = query;

    const documentWhere = {};

    if (search) {
      documentWhere.title = {
        [Op.like]: `%${search}%`,
      };
    }

    if (category_id) {
      documentWhere.category_id = category_id;
    }

    const { count, rows } = await db.SavedDocument.findAndCountAll({
      where: { user_id: userId },
      include: [
        {
          model: db.Document,
          as: "document",
          where: documentWhere,
          include: [
            {
              model: db.User,
              as: "uploader",
              attributes: ["id", "first_name", "last_name", "username", "email", "avatar_url"],
            },
            {
              model: db.Category,
              as: "category",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: per_page,
      offset,
    });

    // Get saved count for each document
    const documents = await Promise.all(
      rows.map(async (saved) => {
        const doc = saved.document.toJSON();
        const savedCount = await db.SavedDocument.count({
          where: { document_id: doc.id },
        });
        return {
          ...doc,
          saved_at: saved.created_at,
          saved_count: savedCount,
        };
      })
    );

    const pagination = getPaginationMeta(count, page, per_page);

    return { documents, pagination };
  }

  async isDocumentSaved(documentId, userId) {
    const saved = await db.SavedDocument.findOne({
      where: { user_id: userId, document_id: documentId },
    });

    return !!saved;
  }
}

module.exports = new DocumentService();
