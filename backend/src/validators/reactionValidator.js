const Joi = require("joi");
const { responseError } = require("../utils/apiResponse");

const validateCreateReaction = (req, res, next) => {
  const schema = Joi.object({
    target_type: Joi.string()
      .valid("story", "comment")
      .required()
      .messages({
        "any.required": "Target type is required",
        "any.only": "Target type must be either 'story' or 'comment'",
      }),
    target_id: Joi.number().integer().positive().required().messages({
      "number.base": "Target ID must be a number",
      "number.integer": "Target ID must be an integer",
      "number.positive": "Target ID must be positive",
      "any.required": "Target ID is required",
    }),
    reaction_type: Joi.string()
      .valid("like", "love", "haha", "support", "sad", "upvote", "downvote")
      .required()
      .messages({
        "any.required": "Reaction type is required",
        "any.only":
          "Reaction type must be one of: like, love, haha, support, sad, upvote, downvote",
      }),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return responseError(res, "Validation failed", 400, errors);
  }

  next();
};

const validateGetReactions = (req, res, next) => {
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

module.exports = {
  validateCreateReaction,
  validateGetReactions,
};

