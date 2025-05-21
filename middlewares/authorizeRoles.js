const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied" });
        }
        console.log("Current user role:", req.user.role);
        console.log("Allowed roles:", roles);
        next();
    };
};

module.exports = { authorizeRoles };