const storyService = require("../services/storyService");
const {
  responseOk,
  responseOkWithPagination,
} = require("../utils/apiResponse");
const asyncHandler = require("../middlewares/asyncHandler");
const { HTTP_STATUS } = require("../constants");

class StoryController {
  getAll = asyncHandler(async (req, res) => {
    const { stories, pagination } = await storyService.getAll(req.query);
    return responseOkWithPagination(
      res,
      stories,
      pagination,
      "Stories retrieved successfully"
    );
  });

  getById = asyncHandler(async (req, res) => {
    const story = await storyService.getById(req.params.id);
    // Increment view count
    await storyService.incrementViewCount(req.params.id);
    return responseOk(res, story, "Story retrieved successfully");
  });

  create = asyncHandler(async (req, res) => {
    // Get image URLs if files were uploaded
    let imageUrls = null;
    console.log("Files received:", req.files ? req.files.length : 0);
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(
        (file) => `/uploads/stories/${file.filename}`
      );
      console.log("Image URLs:", imageUrls);
      // Store as JSON string in image_url field (for backward compatibility)
      // Frontend will parse this as array
      imageUrls = JSON.stringify(imageUrls);
    } else if (req.body.image_urls) {
      // If image_urls is provided as JSON string, use it directly
      imageUrls = req.body.image_urls;
    }

    const story = await storyService.create(
      { ...req.body, image_url: imageUrls },
      req.user.id
    );
    return responseOk(
      res,
      story,
      "Story created successfully",
      HTTP_STATUS.CREATED
    );
  });

  update = asyncHandler(async (req, res) => {
    // Get image URLs if files were uploaded
    let imageUrls = req.body.image_urls; // Keep existing if provided
    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map(
        (file) => `/uploads/stories/${file.filename}`
      );
      // If there are existing images, merge them
      if (req.body.image_urls) {
        try {
          const existingUrls = JSON.parse(req.body.image_urls);
          imageUrls = JSON.stringify([...existingUrls, ...newImageUrls]);
        } catch (e) {
          // If parsing fails, use new images only
          imageUrls = JSON.stringify(newImageUrls);
        }
      } else {
        imageUrls = JSON.stringify(newImageUrls);
      }
    }

    const story = await storyService.update(
      req.params.id,
      { ...req.body, image_url: imageUrls },
      req.user.id
    );
    return responseOk(res, story, "Story updated successfully");
  });

  delete = asyncHandler(async (req, res) => {
    const result = await storyService.delete(req.params.id, req.user.id);
    return responseOk(res, result, "Story deleted successfully");
  });

  getTrending = asyncHandler(async (req, res) => {
    const stories = await storyService.getTrending(req.query);
    return responseOk(res, stories, "Trending stories retrieved successfully");
  });
}

module.exports = new StoryController();
