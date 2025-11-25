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
  password: Joi.string().min(8).required().messages({
    "any.required": "Password is required",
    "string.empty": "Password is required",
    "string.min": "Password must be at least 8 characters",
  }),
  full_name: Joi.string().min(2).max(100).required().messages({
    "any.required": "Full name is required",
    "string.empty": "Full name is required",
    "string.min": "Full name must be at least 2 characters",
    "string.max": "Full name must not exceed 100 characters",
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
