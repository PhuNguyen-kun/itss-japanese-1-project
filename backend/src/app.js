const express = require("express");
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/stories", require("./routes/storyRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));
app.use("/api/reactions", require("./routes/reactionRoutes"));
app.use("/api/topics", require("./routes/topicRoutes"));
app.use("/api/documents", require("./routes/documentRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/saved-stories", require("./routes/savedStoryRoutes"));
app.use("/api/follows", require("./routes/followRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Serve static files for uploaded images
app.use("/uploads", express.static("uploads"));

app.use(errorHandler);

module.exports = app;
