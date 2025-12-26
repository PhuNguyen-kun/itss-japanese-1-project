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
      include: [
        {
          model: db.Department,
          as: "department",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Get user's story count
    const storyCount = await db.Story.count({
      where: { user_id: userId },
    });

    // Get user's saved stories count
    const savedStoryCount = await db.SavedStory.count({
      where: { user_id: userId },
    });

    // Get followers count
    const followersCount = await db.Follow.count({
      where: { following_id: userId },
    });

    // Get following count
    const followingCount = await db.Follow.count({
      where: { follower_id: userId },
    });

    return {
      ...user.toJSON(),
      story_count: storyCount,
      saved_story_count: savedStoryCount,
      followers_count: followersCount,
      following_count: followingCount,
    };
  }

  async getUserById(userId) {
    const user = await db.User.findByPk(userId, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: db.Department,
          as: "department",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!user) {
      throw new NotFoundError("ユーザーが見つかりません");
    }

    // Get user's story count
    const storyCount = await db.Story.count({
      where: { user_id: userId },
    });

    // Get user's saved stories count
    const savedStoryCount = await db.SavedStory.count({
      where: { user_id: userId },
    });

    // Get followers count
    const followersCount = await db.Follow.count({
      where: { following_id: userId },
    });

    // Get following count
    const followingCount = await db.Follow.count({
      where: { follower_id: userId },
    });

    return {
      ...user.toJSON(),
      story_count: storyCount,
      saved_story_count: savedStoryCount,
      followers_count: followersCount,
      following_count: followingCount,
    };
  }

  async updateProfile(userId, profileData) {
    const user = await db.User.findByPk(userId);

    if (!user) {
      throw new NotFoundError("ユーザーが見つかりません");
    }

    // Update allowed fields
    const allowedFields = [
      "first_name",
      "last_name",
      "bio",
      "current_job",
      "work_experience",
      "specialization",
      "department_id",
      "avatar_url",
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (profileData[field] !== undefined) {
        updateData[field] = profileData[field];
      }
    });

    await user.update(updateData);

    return user.toJSON();
  }
}

module.exports = new AuthService();
