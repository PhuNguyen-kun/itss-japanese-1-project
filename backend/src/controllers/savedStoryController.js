const asyncHandler = require("../middlewares/asyncHandler");
const savedStoryService = require("../services/savedStoryService");
const { responseOk } = require("../utils/apiResponse");
const { HTTP_STATUS } = require("../utils/constants");

class SavedStoryController {
  saveStory = asyncHandler(async (req, res) => {
    const { storyId } = req.params;
    const savedStory = await savedStoryService.saveStory(req.user.id, storyId);
    return responseOk(
      res,
      savedStory,
      "Story saved successfully",
      HTTP_STATUS.CREATED
    );
  });

  unsaveStory = asyncHandler(async (req, res) => {
    const { storyId } = req.params;
    const result = await savedStoryService.unsaveStory(req.user.id, storyId);
    return responseOk(res, result, "Story unsaved successfully");
  });

  getSavedStories = asyncHandler(async (req, res) => {
    const result = await savedStoryService.getSavedStories(
      req.user.id,
      req.query
    );
    return responseOk(res, result, "Saved stories retrieved successfully");
  });

  checkIfSaved = asyncHandler(async (req, res) => {
    const { storyId } = req.params;
    const result = await savedStoryService.checkIfSaved(req.user.id, storyId);
    return responseOk(res, result, "Check completed");
  });
}

module.exports = new SavedStoryController();

