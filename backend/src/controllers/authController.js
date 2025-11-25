const authService = require("../services/authService");
const { responseOk } = require("../utils/apiResponse");
const asyncHandler = require("../middlewares/asyncHandler");
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
}

module.exports = new AuthController();
