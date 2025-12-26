const Joi = require("joi");
const { responseError } = require("../utils/apiResponse");

const validateGetAllStories = (req, res, next) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).optional().messages({
      "number.base": "Page must be a number",
      "number.integer": "Page must be an integer",
      "number.min": "Page must be at least 1",
    }),
    per_page: Joi.number().integer().min(1).max(100).optional().messages({
      "number.base": "Per page must be a number",
      "number.integer": "Per page must be an integer",
      "number.min": "Per page must be at least 1",
      "number.max": "Per page must not exceed 100",
    }),
    user_id: Joi.number().integer().positive().optional().messages({
      "number.base": "User ID must be a number",
      "number.integer": "User ID must be an integer",
      "number.positive": "User ID must be positive",
    }),
  });

  const { error } = schema.validate(req.query, { abortEarly: false });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return responseError(res, "Validation failed", 400, errors);
  }

  next();
};

const validateCreateStory = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(1).max(255).required().messages({
      "string.min": "Title must be at least 1 character",
      "string.max": "Title must not exceed 255 characters",
      "any.required": "Title is required",
    }),
    content: Joi.string().min(1).required().messages({
      "string.min": "Content must be at least 1 character",
      "any.required": "Content is required",
    }),
    topic_id: Joi.number()
      .integer()
      .positive()
      .allow(null)
      .optional()
      .messages({
        "number.base": "Topic ID must be a number",
        "number.integer": "Topic ID must be an integer",
        "number.positive": "Topic ID must be positive",
      }),
    image_url: Joi.string().max(5000).allow(null).optional().messages({
      "string.max": "Image URL must not exceed 5000 characters",
    }),
    image_urls: Joi.string().max(5000).allow(null).optional().messages({
      "string.max": "Image URLs must not exceed 5000 characters",
    }),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return responseError(res, "Validation failed", 400, errors);
  }

  next();
};

const validateUpdateStory = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(1).max(255).optional().messages({
      "string.min": "Title must be at least 1 character",
      "string.max": "Title must not exceed 255 characters",
    }),
    content: Joi.string().min(1).optional().messages({
      "string.min": "Content must be at least 1 character",
    }),
    topic_id: Joi.number()
      .integer()
      .positive()
      .allow(null)
      .optional()
      .messages({
        "number.base": "Topic ID must be a number",
        "number.integer": "Topic ID must be an integer",
        "number.positive": "Topic ID must be positive",
      }),
    image_url: Joi.string().max(5000).allow(null).optional().messages({
      "string.max": "Image URL must not exceed 5000 characters",
    }),
    image_urls: Joi.string().max(5000).allow(null).optional().messages({
      "string.max": "Image URLs must not exceed 5000 characters",
    }),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return responseError(res, "Validation failed", 400, errors);
  }

  next();
};

module.exports = {
  validateGetAllStories,
  validateCreateStory,
  validateUpdateStory,
};
