const jwt = require("jsonwebtoken");
//const User = require("../models/auth.js");

const authMiddleware = async (req, res, next) => {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token or invalid format" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.log("Decoded token:", decoded);
        next();
    } catch (err) {
        console.error("Token verification error:", err);
        res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = { authMiddleware };




// const authMiddleware = async (req, res, next) => {

//     const { authorization } = req.headers;

//     if(!authorization) {
//         return res.status(401).json({ message: "No token provided" });
//     }
//     const token = authorization.split(" ")[1];

//     try{
//         const {_id} = jwt.verify(token, process.env.JWT_SECRET)
//         req.user = await User.findOne({_id}).select("_id")
//         next();
//     }catch(error){
//         console.log(error)
//         res.status(401).json({ message: "Invalid token" });
//     }
// }
// module.exports = { authMiddleware };