const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/auth");
const uploadAvatar = require("../middlewares/uploadAvatar");
const {
  validateRegister,
  validateLogin,
} = require("../validators/authValidator");

router.post("/register", validateRegister, authController.register);
router.post("/login", validateLogin, authController.login);
router.post("/logout", authMiddleware, authController.logout);
router.get("/me", authMiddleware, authController.getProfile);
router.get("/users/:id", authMiddleware, authController.getUserById);
router.put("/profile", authMiddleware, authController.updateProfile);
router.post("/avatar", authMiddleware, uploadAvatar, authController.uploadAvatar);

module.exports = router;
