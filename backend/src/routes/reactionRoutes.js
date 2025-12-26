const express = require("express");
const router = express.Router();
const reactionController = require("../controllers/reactionController");
const authMiddleware = require("../middlewares/auth");
const {
  validateCreateReaction,
  validateGetReactions,
} = require("../validators/reactionValidator");

// Get reactions by target (story or comment)
router.get(
  "/:targetType/:targetId",
  validateGetReactions,
  reactionController.getByTarget
);

// Create reaction
router.post(
  "/",
  authMiddleware,
  validateCreateReaction,
  reactionController.create
);

// Delete reaction
router.delete("/:id", authMiddleware, reactionController.delete);

module.exports = router;

