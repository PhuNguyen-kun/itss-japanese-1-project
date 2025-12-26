const Joi = require("joi");

const signupSchema = Joi.object({
  username: Joi.string().min(3).max(50).required().messages({
    "any.required": "Username is required",
    "string.empty": "Username is required",
    "string.min": "Username must be at least 3 characters",
    "string.max": "Username must not exceed 50 characters",
  }),
  email: Joi.string().email().required().messages({
    "any.required": "Email is required",
    "string.empty": "Email is required",
    "string.email": "Invalid email format",
  }),
  password: Joi.string()
    .min(8)
    .required()
    .custom((value, helpers) => {
      // Check if password contains at least 2 types of characters
      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      const hasSymbol = /[^A-Za-z0-9]/.test(value);

      const typeCount = [
        hasUpperCase,
        hasLowerCase,
        hasNumber,
        hasSymbol,
      ].filter(Boolean).length;

      if (typeCount < 2) {
        return helpers.error("password.weak");
      }

      return value;
    })
    .messages({
      "any.required": "Password is required",
      "string.empty": "Password is required",
      "string.min": "Password must be at least 8 characters",
      "password.weak":
        "Password must contain at least 2 types of characters (uppercase, lowercase, numbers, or symbols)",
    }),
  firstName: Joi.string().min(1).max(50).required().messages({
    "any.required": "First name is required",
    "string.empty": "First name is required",
    "string.min": "First name must be at least 1 character",
    "string.max": "First name must not exceed 50 characters",
  }),
  lastName: Joi.string().min(1).max(50).required().messages({
    "any.required": "Last name is required",
    "string.empty": "Last name is required",
    "string.min": "Last name must be at least 1 character",
    "string.max": "Last name must not exceed 50 characters",
  }),
  department_id: Joi.number().integer().optional().allow(null).messages({
    "number.base": "Department ID must be a number",
  }),
  role: Joi.string().valid("admin", "teacher").optional().messages({
    "any.only": "Role must be either admin or teacher",
  }),
  avatar_url: Joi.string().uri().optional().allow(null, "").messages({
    "string.uri": "Avatar URL must be a valid URL",
  }),
});

const signinSchema = Joi.object({
  username: Joi.string().required().messages({
    "any.required": "Username is required",
    "string.empty": "Username is required",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
    "string.empty": "Password is required",
  }),
});

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    req.body = value;
    next();
  };
};

module.exports = {
  validateRegister: validate(signupSchema),
  validateLogin: validate(signinSchema),
};
