const express = require("express");
const router = express.Router();
const topicController = require("../controllers/topicController");
const auth = require("../middlewares/auth");

// Get all topics (no pagination)
router.get("/", auth, topicController.getAll);
router.get("/trending", topicController.getTrending);

module.exports = router;
