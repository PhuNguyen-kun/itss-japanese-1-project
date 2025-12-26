const express = require("express");
const router = express.Router();
const documentController = require("../controllers/documentController");
const authMiddleware = require("../middlewares/auth");
const uploadDocument = require("../middlewares/uploadDocument");
const asyncHandler = require("../middlewares/asyncHandler");

// Simple validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    req.body = value;
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    req.query = value;
    next();
  };
};

const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    req.params = value;
    next();
  };
};

const Joi = require("joi");

// Validation schemas
const uploadDocumentSchema = Joi.object({
  title: Joi.string().max(255).required().messages({
    "string.empty": "Title is required",
    "string.max": "Title must not exceed 255 characters",
  }),
  description: Joi.string().allow("", null).optional(),
  category_id: Joi.number().integer().positive().allow(null).optional(),
});

const getDocumentsSchema = Joi.object({
  search: Joi.string().allow("").optional(),
  category_id: Joi.number().integer().positive().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

const getDocumentByIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "Invalid document ID",
    "any.required": "Document ID is required",
  }),
});

// Upload a new document
router.post(
  "/",
  authMiddleware,
  uploadDocument.single("file"),
  validate(uploadDocumentSchema),
  asyncHandler(documentController.uploadDocument)
);

// Get all documents (with search and filters)
router.get(
  "/",
  authMiddleware,
  validateQuery(getDocumentsSchema),
  asyncHandler(documentController.getDocuments)
);

// Get my uploaded documents
router.get(
  "/my",
  authMiddleware,
  validateQuery(getDocumentsSchema),
  asyncHandler(documentController.getMyDocuments)
);

// Get saved documents
router.get(
  "/saved",
  authMiddleware,
  validateQuery(getDocumentsSchema),
  asyncHandler(documentController.getSavedDocuments)
);

// Get a single document by ID
router.get(
  "/:id",
  authMiddleware,
  validateParams(getDocumentByIdSchema),
  asyncHandler(documentController.getDocumentById)
);

// Delete a document
router.delete(
  "/:id",
  authMiddleware,
  validateParams(getDocumentByIdSchema),
  asyncHandler(documentController.deleteDocument)
);

// Save/bookmark a document
router.post(
  "/:id/save",
  authMiddleware,
  validateParams(getDocumentByIdSchema),
  asyncHandler(documentController.saveDocument)
);

// Unsave/remove bookmark from a document
router.delete(
  "/:id/save",
  authMiddleware,
  validateParams(getDocumentByIdSchema),
  asyncHandler(documentController.unsaveDocument)
);

module.exports = router;
