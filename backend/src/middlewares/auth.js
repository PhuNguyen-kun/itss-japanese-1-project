const JwtHelper = require("../utils/jwtHelper");
const { responseError } = require("../utils/apiResponse");
const db = require("../models");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return responseError(res, "Access token is required", 401);
    }

    const token = authHeader.substring(7);
    const decoded = JwtHelper.verifyToken(token);

    const user = await db.User.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user || user.status !== "active") {
      return responseError(res, "User not found or inactive", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.message === "TOKEN_EXPIRED") {
      return responseError(res, "Token has expired", 401);
    }
    return responseError(res, "Invalid token", 401);
  }
};

module.exports = authMiddleware;
