const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
 
    const authHeader = req.header("Authorization");

    if (!authHeader) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }
    if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Invalid token format" });
    }

    // Extract the token
    const token = authHeader.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, "your_secret_key"); 
        req.user = decoded; 
        next(); 
    } catch (err) {
        console.error("Token verification error:", err);
        res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = {authMiddleware};