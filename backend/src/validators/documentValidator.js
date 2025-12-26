const Joi = require("joi");

const uploadDocument = {
  body: Joi.object({
    title: Joi.string().max(255).required().messages({
      "string.empty": "Title is required",
      "string.max": "Title must not exceed 255 characters",
    }),
    description: Joi.string().allow("", null).optional(),
    category_id: Joi.number().integer().positive().allow(null).optional(),
  }),
};

const getDocuments = {
  query: Joi.object({
    search: Joi.string().allow("").optional(),
    category_id: Joi.number().integer().positive().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};

const getDocumentById = {
  params: Joi.object({
    id: Joi.number().integer().positive().required().messages({
      "number.base": "Invalid document ID",
      "any.required": "Document ID is required",
    }),
  }),
};

module.exports = {
  uploadDocument,
  getDocuments,
  getDocumentById,
};
