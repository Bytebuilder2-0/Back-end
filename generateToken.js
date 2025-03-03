const jwt = require("jsonwebtoken");

// Manually generate a token for testing

const userId = "-------"                       // Replace with a valid user ID from your database
const token = jwt.sign({ id: userId }, "your_secret_key", { expiresIn: "1h" });
const decoded = jwt.verify(token, "your_secret_key");

console.log("Generated Token:", token);
console.log("Generated Token:", decoded);