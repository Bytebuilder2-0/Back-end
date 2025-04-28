const Appointment = require("../models/Appointment.js");
const User = require("../models/User");
const mongoose = require("mongoose");
const Vehicle = require("../models/Vehicle");
const Service = require("../models/Service");
const Budget = require("../models/Budget.js");

// 1️ Create a new appointment (Client submits form)
const createAppointment = async (req, res) => {
  try {
    const {
      vehicleObject,
      services,
      issue,
      preferredDate,
      preferredTime,
      expectedDeliveryDate,
      contactNumber,
    } = req.body;

    if (
      !services ||
      !issue ||
      !preferredDate ||
      !expectedDeliveryDate ||
      !contactNumber
    ) {
      return res.status(400).json({ message: "All fields are required......" });
    }
    const userId = req.params.user_id;

    const userVehicles = await Vehicle.find({ user: userId });

    const selectedVehicle = userVehicles.find(
      (vehicle) => vehicle._id.toString() === vehicleObject
    );

    if (!selectedVehicle) {
      return res.status(400).json({ message: "Invalid vehicle selected" });
    }

    const validServices = await Service.find({}, { name: 1, _id: 0 });

    const validServiceNames = validServices.map((service) =>
      service.name.trim().toLowerCase()
    );

    const selectedServices = services.filter((service) =>
      validServiceNames.includes(service.trim().toLowerCase())
    );

    if (selectedServices.length === 0) {
      return res
        .status(400)
        .json({ message: "Please select at least one valid service" });
    }

    if (!/^94\d{9}$/.test(contactNumber)) {
      return res.status(400).json({
        message:
          "Invalid contact number (must start with '94' followed by 9 digits, e.g., 94771234567)",
      });
    }

    const preferDate = new Date(preferredDate);
    const deliveryDate = new Date(expectedDeliveryDate);
    if (deliveryDate <= new Date() && preferDate <= new Date()) {
      return res.status(400).json({ message: "Date must be in the future" });
    }
    if (deliveryDate < preferDate) {
      return res
        .status(400)
        .json({ message: "Delivery date must be future than prefered date " });
    }

    if (!/^\d{1,2}:\d{2} (AM|PM)$/i.test(preferredTime)) {
      return res
        .status(400)
        .json({ message: "Invalid preferred time format (use HH:MM AM/PM)" });
    }

    // Step 1: Create a new appointment
    const newAppointment = new Appointment({
      userId,
      vehicleObject,
      vehicleNumber: selectedVehicle.vehicleNumber,
      model: selectedVehicle.model,
      issue,
      status: "Pending",
      services: selectedServices,
      preferredDate: preferDate,
      preferredTime,
      expectedDeliveryDate: deliveryDate,
      contactNumber,
    });

    await newAppointment.save();

    // Step 2: Create a linked budget (only references appointmentId)
    const newBudget = new Budget({
      appointmentId: newAppointment._id, // Link to appointment
      amountAllocations: [],
      totalAmount: 0,
    });

    await newBudget.save();

    // Step 3: (Optional) Link the budget in the appointment model if needed
    newAppointment.budgetId = newBudget._id;
    await newAppointment.save();

    res.status(201).json({
      message: "✅ Appointment and Budget created successfully",
      appointment: newAppointment,
      budget: newBudget,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    console.error("🚨 Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const fetchApppintmetDetails = async (req, res) => {
  try {
    const appointmentId = req.params.appointment_id;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({ error: error.message });
  }
};

//get all appointments related to user

const getUserAppointments = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const userExists = await User.exists({ _id: userObjectId });
    if (!userExists) {
      console.log(`User ${userId} not found`);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    // Find all appointments for the user
    const appointments = await Appointment.find({
      userId: userObjectId,
    }).lean();

    console.log(`Found ${appointments.length} appointments for user ${userId}`);
    console.log("Found appointments:", appointments);

    if (appointments.length === 0) {
      console.log(`[WARN] No appointments found for user ${userId}`);
    }
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error("Error fetching user appointments:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Server error while fetching appointments",
        error: error.message,
      });
    }
  }
};

// 2️ Get all appointments (Supervisor dashboarrd)
const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find(
      {},
      "vehicleId vehicleNumber model issue reason workload tech status techMessage contactNumber payment appointmentId suggestion expectedDeliveryDate"
    );
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3️ Update workload for an appointment (Supervisor updates workload)
const updateWorkload = async (req, res) => {
  const { workload } = req.body; // Expecting an array of objects
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid appointment ID format" });
  }

  try {
    // Find the appointment
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Validate workload: should be an array with valid items
    if (!Array.isArray(workload) || workload.length === 0) {
      return res
        .status(400)
        .json({ message: "Workload must be a non-empty array" });
    }

    // Validate structure of workload items
    for (const task of workload) {
      if (
        typeof task.step !== "number" ||
        typeof task.description !== "string" ||
        (task.status &&
          !["Pending", "In Progress", "Completed"].includes(task.status))
      ) {
        return res.status(400).json({ message: "Invalid workload format" });
      }
    }

    // Update the appointment's workload
    appointment.workload = workload;
    await appointment.save();

    // Update the linked Budget model with the new workload data
    const updatedBudget = await Budget.findOneAndUpdate(
      { appointmentId: appointment._id },
      {
        amountAllocations: workload.map((task) => ({
          step: task.step,
          des: task.description,
          amount: 0, // Default amount, supervisor will update later
        })),
      },
      { new: true }
    );

    if (!updatedBudget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    return res.status(200).json({
      message: "Workload and Budget updated successfully",
      appointment,
      budget: updatedBudget,
    });
  } catch (error) {
    console.error("Error updating workload:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const suggestionWrite = async (req, res) => {
  const { suggestion } = req.body;
  const { appointmentId } = req.params;

  if (!mongoose.isValidObjectId(appointmentId)) {
    return res.status(400).json({ message: "Invalid appointment ID format" });
  }

  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (!suggestion || suggestion.trim() === "") {
      return res.status(400).json({ message: "Suggestion cannot be empty" });
    }

    appointment.suggestion = suggestion;
    await appointment.save();

    res.json({ message: "✅ Suggestion updated successfully", appointment });
  } catch (error) {
    console.error("🚨 Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const getWorkload = (req, res) => {
  const appointmentId = req.params.id;
  Appointment.findById(appointmentId)
    .then((appointment) => {
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json({ workload: appointment.workload }); // Send the workload data
    })
    .catch((error) => {
      res.status(500).json({ message: "Error fetching workload", error });
    });
};

const getCount = async (req, res) => {
  try {
    const total = await Appointment.countDocuments();
    const pending = await Appointment.countDocuments({ status: "Pending" });
    const confirmed = await Appointment.countDocuments({ status: "Confirmed" });

    res.json({ total, pending, confirmed });
  } catch (error) {
    console.error("Error fetching appointment counts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAssigned = async (req, res) => {
  try {
    const jobs = await Appointment.find({ status: "Assigned" });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//chamod
const getTechMessage = (req, res) => {
  const appointmentId = req.params.id;
  Appointment.findById(appointmentId)
    .then((appointment) => {
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json({ techMessage: appointment.techMessage }); // Send the workload data
    })
    .catch((error) => {
      res.status(500).json({ message: "Error fetching workload", error });
    });
};

//chamod
module.exports = {
  createAppointment,
  getUserAppointments,
  getAppointments,
  updateWorkload,
  fetchApppintmetDetails,
  getWorkload,
  suggestionWrite,
  getCount,
  getAssigned,
  getTechMessage,
};
