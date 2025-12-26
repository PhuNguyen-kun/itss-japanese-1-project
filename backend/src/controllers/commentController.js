const commentService = require("../services/commentService");
const {
  responseOk,
  responseOkWithPagination,
} = require("../utils/apiResponse");
const asyncHandler = require("../middlewares/asyncHandler");
const { HTTP_STATUS } = require("../constants");

class CommentController {
  getByStoryId = asyncHandler(async (req, res) => {
    const { comments, pagination } = await commentService.getByStoryId(
      req.params.storyId,
      req.query
    );
    return responseOkWithPagination(
      res,
      comments,
      pagination,
      "Comments retrieved successfully"
    );
  });

  getById = asyncHandler(async (req, res) => {
    const comment = await commentService.getById(req.params.id);
    return responseOk(res, comment, "Comment retrieved successfully");
  });

  create = asyncHandler(async (req, res) => {
    const comment = await commentService.create(
      req.params.storyId,
      req.body,
      req.user.id
    );
    return responseOk(
      res,
      comment,
      "Comment created successfully",
      HTTP_STATUS.CREATED
    );
  });

  update = asyncHandler(async (req, res) => {
    const comment = await commentService.update(
      req.params.id,
      req.body,
      req.user.id
    );
    return responseOk(res, comment, "Comment updated successfully");
  });

  delete = asyncHandler(async (req, res) => {
    const result = await commentService.delete(req.params.id, req.user.id);
    return responseOk(res, result, "Comment deleted successfully");
  });
}

module.exports = new CommentController();

