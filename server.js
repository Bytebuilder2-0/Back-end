const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db.js");

const appointmentRoutes = require("./routes/appointmentRoutes.js");
const technicianRoutes = require("./routes/technicianRoutes.js");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Mount appointment routes
app.use("/api/appointments", appointmentRoutes);
app.use("/api/technicians", technicianRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
