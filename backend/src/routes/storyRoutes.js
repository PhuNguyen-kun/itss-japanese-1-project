const express = require("express");
const router = express.Router();
const storyController = require("../controllers/storyController");
const authMiddleware = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const {
  validateGetAllStories,
  validateCreateStory,
  validateUpdateStory,
} = require("../validators/storyValidator");

router.get("/", validateGetAllStories, storyController.getAll);
router.get("/trending", storyController.getTrending);
router.get("/:id", storyController.getById);
router.post(
  "/",
  authMiddleware,
  upload.array("images", 10), // Support up to 10 images
  validateCreateStory,
  storyController.create
);
router.put(
  "/:id",
  authMiddleware,
  upload.array("images", 10), // Support up to 10 images
  validateUpdateStory,
  storyController.update
);
router.delete("/:id", authMiddleware, storyController.delete);

module.exports = router;
