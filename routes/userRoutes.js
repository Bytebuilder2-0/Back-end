const express = require("express");
const router = express.Router();
const { registerUser } = require("../controllers/userController");
const { getUserById } = require("../controllers/userController");

router.post("/register", registerUser);
router.get("/:user_id", getUserById);

module.exports = router;
