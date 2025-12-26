const express = require("express");
const router = express.Router();
const followController = require("../controllers/followController");
const authMiddleware = require("../middlewares/auth");

// All routes require authentication
router.use(authMiddleware);

// Follow/unfollow a user
router.post("/:userId/follow", followController.follow);
router.delete("/:userId/unfollow", followController.unfollow);

// Get followers and following lists
router.get("/:userId/followers", followController.getFollowers);
router.get("/:userId/following", followController.getFollowing);

// Check if following a user
router.get("/:userId/check", followController.checkIfFollowing);

module.exports = router;

