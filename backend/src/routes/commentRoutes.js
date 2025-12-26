const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const authMiddleware = require("../middlewares/auth");
const {
  validateGetComments,
  validateCreateComment,
  validateUpdateComment,
} = require("../validators/commentValidator");

// Comments for a specific story
router.get(
  "/stories/:storyId/comments",
  validateGetComments,
  commentController.getByStoryId
);
router.post(
  "/stories/:storyId/comments",
  authMiddleware,
  validateCreateComment,
  commentController.create
);

// Individual comment operations
router.get("/:id", commentController.getById);
router.put(
  "/:id",
  authMiddleware,
  validateUpdateComment,
  commentController.update
);
router.delete("/:id", authMiddleware, commentController.delete);

module.exports = router;

