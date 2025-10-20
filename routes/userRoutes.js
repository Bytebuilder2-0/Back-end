// const express = require("express");
// const router = express.Router();
// const { registerUser } = require("../controllers/userController");
// const { getUserById } = require("../controllers/userController");

// router.post("/register", registerUser);
// router.get("/:user_id", getUserById);

// module.exports = router;

const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/userAuthMiddleware");
const parser = require("../middlewares/cloudinaryMulter");
const {
  registerUser,
  updateUserProfile,
  getUserProfile,
  deleteUser,
  getUserById,
} = require("../controllers/userController");

router.post("/register", registerUser);

router.get("/profile",authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, parser.single('profilePhoto'), updateUserProfile);
router.delete("/profile", authMiddleware, deleteUser);
router.get("/:user_id", getUserById);

module.exports = router;
