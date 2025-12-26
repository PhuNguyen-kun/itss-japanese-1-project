const { USER_ROLES } = require("../constants");
const { responseError } = require("../utils/apiResponse");
const { HTTP_STATUS } = require("../constants");
const authMiddleware = require("./auth");

// Admin middleware - must be used after authMiddleware
const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return responseError(
      res,
      "Authentication required",
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  if (req.user.role !== USER_ROLES.ADMIN) {
    return responseError(res, "Admin access required", HTTP_STATUS.FORBIDDEN);
  }

  next();
};

module.exports = adminMiddleware;
