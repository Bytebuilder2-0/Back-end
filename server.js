const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db.js");

const appointmentRoutes = require("./routes/appointmentRoutes.js");
const technicianRoutes = require("./routes/technicianRoutes.js");
const budgetRoutes = require("./routes/budgetRoutes.js");
const userRoutes = require("./routes/userRoutes.js");

const authRoutes = require("./routes/authRouter.js");
const { authMiddleware } = require("./middlewares/userAuthMiddleware.js");
const feedbackRoutes = require("./routes/feedbackRoutes");
const service = require("./routes/serviceManageRoutes.js");
const { addToBlacklist } = require("./utils/blacklist.js"); // Import the blacklist utility

dotenv.config();
connectDB();

const app = express();

//Middlewares
app.use(cors());
app.use(bodyParser.json());

//Routes
app.use("/api/auth", authRoutes);
app.use(authMiddleware);
app.use("/api/helloworld", (req, res) => res.send("Hello World")) // Apply the auth middleware to all routes below this line
app.use("/api/appointments", appointmentRoutes);
app.use("/api/technicians", technicianRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/user", userRoutes);
app.use("/api/feedback", feedbackRoutes);

app.use("/api/servicesManage", service);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));