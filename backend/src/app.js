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

app.use(errorHandler);

module.exports = app;
