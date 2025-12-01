const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");

const connectDB = require("./config/db.js");

const appointmentRoutes = require("./routes/appointmentRoutes.js");
const technicianRoutes = require("./routes/technicianRoutes.js");
const budgetRoutes = require("./routes/budgetRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const feedbackRoutes = require("./routes/feedbackRoutes");
const service = require("./routes/serviceManageRoutes.js");
const paymentRoutes = require("./routes/paymentRoutes.js");
const feedbackDisplayRoutes = require("./routes/feedbackdisplay.js");
const supervisorRoutes = require("./routes/supervisorRoutes.js");

const authRoutes = require("./routes/authRouter.js");
const { authMiddleware } = require("./middlewares/userAuthMiddleware.js");
const { addToBlacklist } = require("./utils/blacklist.js"); // Import the blacklist utility

dotenv.config();
connectDB();

const app = express();

//Middlewares
const corsOptions = {
  origin: process.env.FRONTEND_BASE_URL || '*',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

//Routes

app.use("/api/feedbackDisplay", feedbackDisplayRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use(authMiddleware);

app.use("/api/appointments", appointmentRoutes);
app.use("/api/technicians", technicianRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/user", userRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/servicesManage", service);
app.use("/api/supervisor", supervisorRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
