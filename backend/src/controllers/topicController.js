const topicService = require("../services/topicService");
const { responseOk } = require("../utils/apiResponse");
const asyncHandler = require("../middlewares/asyncHandler");

class TopicController {
  getAll = asyncHandler(async (req, res) => {
    const { topics } = await topicService.getAll();
    return responseOk(res, topics, "Topics retrieved successfully");
  });

  getTrending = asyncHandler(async (req, res) => {
    const topics = await topicService.getTrending(req.query);
    return responseOk(res, topics, "Trending topics retrieved successfully");
  });
}

module.exports = new TopicController();
