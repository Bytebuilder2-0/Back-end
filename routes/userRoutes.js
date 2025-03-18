const express = require("express");
const { saveUser, loginUser } = require("../controllers/userController.js");

const userRoutes = express.Router();
userRoutes.post("/", saveUser);
userRoutes.post("/login",loginUser);

module.exports = userRoutes;
