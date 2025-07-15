const express = require("express");
const router = express.Router();
const {
	registerUser,
	loginUser,
	logoutUser,
	forgotPassword,
	resetPassword,
	verifyEmail,
} = require("../controllers/authController.js");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/", resetPassword);
router.get("/verify-email", verifyEmail);

module.exports = router;
