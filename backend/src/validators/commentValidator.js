const Joi = require("joi");
const { responseError } = require("../utils/apiResponse");

const validateGetComments = (req, res, next) => {
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
  });

  const { error } = schema.validate(req.query, { abortEarly: false });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return responseError(res, "Validation failed", 400, errors);
  }

  next();
};

const validateCreateComment = (req, res, next) => {
  const schema = Joi.object({
    content: Joi.string().min(1).required().messages({
      "string.min": "Content must be at least 1 character",
      "any.required": "Content is required",
    }),
    parent_id: Joi.number().integer().positive().optional().allow(null).messages({
      "number.base": "Parent ID must be a number",
      "number.integer": "Parent ID must be an integer",
      "number.positive": "Parent ID must be positive",
    }),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return responseError(res, "Validation failed", 400, errors);
  }

  next();
};

const validateUpdateComment = (req, res, next) => {
  const schema = Joi.object({
    content: Joi.string().min(1).required().messages({
      "string.min": "Content must be at least 1 character",
      "any.required": "Content is required",
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
  validateGetComments,
  validateCreateComment,
  validateUpdateComment,
};

