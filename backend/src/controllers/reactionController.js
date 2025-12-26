const reactionService = require("../services/reactionService");
const {
  responseOk,
  responseOkWithPagination,
} = require("../utils/apiResponse");
const asyncHandler = require("../middlewares/asyncHandler");
const { HTTP_STATUS } = require("../constants");

class ReactionController {
  getByTarget = asyncHandler(async (req, res) => {
    const { targetType, targetId } = req.params;
    const { reactions, pagination } = await reactionService.getByTarget(
      targetType,
      targetId,
      req.query
    );
    return responseOkWithPagination(
      res,
      reactions,
      pagination,
      "Reactions retrieved successfully"
    );
  });

  create = asyncHandler(async (req, res) => {
    const result = await reactionService.create(req.body, req.user.id);
    return responseOk(
      res,
      result,
      result.reaction
        ? "Reaction created successfully"
        : "Reaction removed successfully",
      HTTP_STATUS.CREATED
    );
  });

  delete = asyncHandler(async (req, res) => {
    const result = await reactionService.delete(req.params.id, req.user.id);
    return responseOk(res, result, "Reaction deleted successfully");
  });
}

module.exports = new ReactionController();

