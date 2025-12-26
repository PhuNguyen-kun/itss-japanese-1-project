const followService = require("../services/followService");
const { responseOk } = require("../utils/apiResponse");
const asyncHandler = require("../middlewares/asyncHandler");

class FollowController {
  follow = asyncHandler(async (req, res) => {
    const followerId = req.user.id;
    const followingId = parseInt(req.params.userId);
    const result = await followService.follow(followerId, followingId);
    return responseOk(res, result, result.message);
  });

  unfollow = asyncHandler(async (req, res) => {
    const followerId = req.user.id;
    const followingId = parseInt(req.params.userId);
    const result = await followService.unfollow(followerId, followingId);
    return responseOk(res, result, result.message);
  });

  getFollowers = asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.userId);
    const result = await followService.getFollowers(userId, req.query);
    return responseOk(res, result, "フォロワー一覧を取得しました");
  });

  getFollowing = asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.userId);
    const result = await followService.getFollowing(userId, req.query);
    return responseOk(res, result, "フォロー中一覧を取得しました");
  });

  checkIfFollowing = asyncHandler(async (req, res) => {
    const followerId = req.user.id;
    const followingId = parseInt(req.params.userId);
    const result = await followService.checkIfFollowing(followerId, followingId);
    return responseOk(res, result, "フォロー状態を取得しました");
  });
}

module.exports = new FollowController();

