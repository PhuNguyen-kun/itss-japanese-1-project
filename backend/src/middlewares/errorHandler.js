const { responseError } = require("../utils/apiResponse");
const { IsApiError } = require("../utils/ApiError");

const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  if (IsApiError(err)) {
    return responseError(res, err.message, err.statusCode);
  }

  if (err.name === "SequelizeValidationError") {
    const errors = err.errors.map((e) => e.message);
    return responseError(res, "Validation error", 400, errors);
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    return responseError(res, "Duplicate entry", 409);
  }

  if (err.name === "SequelizeForeignKeyConstraintError") {
    return responseError(res, "Foreign key constraint error", 400);
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Internal server error";

  return responseError(res, message, statusCode);
};

module.exports = errorHandler;
