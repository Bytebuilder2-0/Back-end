const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
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
const notificationRoutes = require("./routes/notificationRoutes.js");

const authRoutes = require("./routes/authRouter.js");
const { authMiddleware } = require("./middlewares/userAuthMiddleware.js");
const { addToBlacklist } = require("./utils/blacklist.js"); // Import the blacklist utility

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

//Middlewares
const allowedOrigins = [
  process.env.FRONTEND_BASE_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  /https:\/\/.*\.vercel\.app$/, // Allow all Vercel preview URLs
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    // Check if origin is in allowed list or matches Vercel pattern
    const isAllowed = allowedOrigins.some((allowed) => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Socket.IO setup
const io = new Server(server, {
  cors: corsOptions,
});

// Store connected users by userId
const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // User joins with their userId
  socket.on("join", (userId) => {
    console.log(`User ${userId} joined with socket ${socket.id}`);
    connectedUsers.set(userId, socket.id);
    socket.userId = userId;
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
    }
  });
});

// Make io available to routes
app.set("io", io);
app.set("connectedUsers", connectedUsers);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

//Routes

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Public routes (no auth required)
app.use("/api/feedbackDisplay", feedbackDisplayRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);

// Apply auth middleware to all routes below
app.use(authMiddleware);

app.use("/api/appointments", appointmentRoutes);
app.use("/api/technicians", technicianRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/user", userRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/servicesManage", service);
app.use("/api/supervisor", supervisorRoutes);
app.use("/api/notifications", notificationRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(` Server running on port ${PORT}`));
