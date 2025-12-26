const authService = require("../services/authService");
const { responseOk } = require("../utils/apiResponse");
const asyncHandler = require("../middlewares/asyncHandler");
const { BadRequestError } = require("../utils/ApiError");
const { HTTP_STATUS } = require("../constants");

class AuthController {
  register = asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    return responseOk(
      res,
      result,
      "User registered successfully",
      HTTP_STATUS.CREATED
    );
  });

  login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    return responseOk(res, result, "Login successful");
  });

  logout = asyncHandler(async (req, res) => {
    return responseOk(res, null, "Logout successful");
  });

  getProfile = asyncHandler(async (req, res) => {
    const user = await authService.getProfile(req.user.id);
    return responseOk(res, user, "Profile retrieved successfully");
  });

  getUserById = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const user = await authService.getUserById(userId);
    return responseOk(res, user, "User retrieved successfully");
  });

  updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const profileData = { ...req.body };

    // Handle avatar upload
    if (req.file) {
      profileData.avatar_url = `/uploads/avatars/${req.file.filename}`;
    }

    const user = await authService.updateProfile(userId, profileData);
    return responseOk(res, user, "プロフィールを更新しました");
  });

  uploadAvatar = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    if (!req.file) {
      throw new BadRequestError("アバター画像を選択してください");
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const user = await authService.updateProfile(userId, { avatar_url: avatarUrl });
    return responseOk(res, user, "アバターを更新しました");
  });
}

module.exports = new AuthController();
