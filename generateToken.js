const jwt = require("jsonwebtoken");

// Manually generate a token for testing

const userId = "67c46e45a44a30f2502cae23"                       // Replace with a valid user ID from your database
const token = jwt.sign({ id: userId }, "your_secret_key", { expiresIn: "1h" });
const decoded = jwt.verify(token, "your_secret_key");

console.log("Generated Token:", token);
console.log("Generated Token:", decoded);