const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/auth");
const {
  validateRegister,
  validateLogin,
} = require("../validators/authValidator");

router.post("/register", validateRegister, authController.register);
router.post("/login", validateLogin, authController.login);
router.post("/logout", authMiddleware, authController.logout);
router.get("/me", authMiddleware, authController.getProfile);

module.exports = router;
