const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/userAuthMiddleware");
const User = require("../models/User");
const { registerUser, updateUserProfile, getUserProfile, deleteUser } = require("../controllers/userController");

router.post("/register", registerUser);
router.put("/profile", authMiddleware, updateUserProfile);
router.get("/profile", authMiddleware, getUserProfile);
router.delete("/profile", authMiddleware , deleteUser);

module.exports = router;