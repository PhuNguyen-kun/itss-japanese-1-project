const jwt = require("jsonwebtoken");

class JwtHelper {
  static generateToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new Error("TOKEN_EXPIRED");
      }
      throw new Error("INVALID_TOKEN");
    }
  }
}

module.exports = JwtHelper;
