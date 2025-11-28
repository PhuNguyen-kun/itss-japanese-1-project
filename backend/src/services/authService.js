const db = require("../models");
const JwtHelper = require("../utils/jwtHelper");
const { USER_ROLES } = require("../constants");
const {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} = require("../utils/ApiError");

class AuthService {
  async register(userData) {
    // Check if username already exists
    const existingUsername = await db.User.findOne({
      where: { username: userData.username },
    });

    if (existingUsername) {
      throw new BadRequestError("このユーザー名は既に使用されています。");
    }

    // Check if email already exists
    const existingEmail = await db.User.findOne({
      where: { email: userData.email },
    });

    if (existingEmail) {
      throw new BadRequestError("このメールアドレスは既に使用されています。");
    }

    const user = await db.User.create({
      username: userData.username,
      email: userData.email,
      password: userData.password,
      first_name: userData.firstName,
      last_name: userData.lastName,
      department_id: userData.department_id || null,
      role: userData.role || USER_ROLES.TEACHER,
      avatar_url: userData.avatar_url || null,
      status: "active",
    });

    const token = JwtHelper.generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    return {
      user: user.toJSON(),
      token,
    };
  }

  async login(username, password) {
    const user = await db.User.findOne({ where: { username } });

    if (!user) {
      throw new UnauthorizedError(
        "ユーザー名またはパスワードが間違っています。"
      );
    }

    if (user.status !== "active") {
      throw new UnauthorizedError("アカウントがアクティブではありません。");
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new UnauthorizedError(
        "ユーザー名またはパスワードが間違っています。"
      );
    }

    const token = JwtHelper.generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    return {
      user: user.toJSON(),
      token,
    };
  }

  async getProfile(userId) {
    const user = await db.User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }
}

module.exports = new AuthService();
