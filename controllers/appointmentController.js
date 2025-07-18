const mongoose = require("mongoose");

const Appointment = require("../models/Appointment.js");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const Service = require("../models/Service");
const Budget = require("../models/Budget.js");
const Feedback = require("../models/Feedback");

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
      status: "Checking",
      services: selectedServices,
      preferredDate: preferDate,
      preferredTime,
      expectedDeliveryDate: deliveryDate,
      contactNumber,
    });

    await newAppointment.save();

    // Create feedback
    const newFeedback = new Feedback({
      appointmentId: newAppointment._id,
    });

    await newFeedback.save();
    newAppointment.feedbackId = newFeedback._id;

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
      message: "Appointment,Budget and FeedBack created successfully",
      appointment: newAppointment,
      budget: newBudget,
      feedback: newFeedback,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    console.error("Error:", error.message);
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

// ----- get all appointments related to user -----
const fetchApppintmetDetailsmanger = async (req, res) => {
  try {
    const appointmentId = req.params.appointment_id;

    const appointment = await Appointment.findById(appointmentId)
      .populate("userId", "name email") // Add this line
      .populate("tech", "employee_id technician_id department fullName")
      .populate("sconfirmedBy", "fullName userName");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({ error: error.message });
  }
};

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

// Get all appointments (Supervisor dashboarrd)
// In appointmentController.js
const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find(
      {},
      "vehicleId vehicleNumber model issue services reason workload tech status techMessage contactNumber payment appointmentId suggestion expectedDeliveryDate sconfirmedBy department preferredDate"
    )
      .populate("tech", "employee_id technician_id department")
      .populate("userId", "name email");
    //.populate("sconfirmedBy", "fullName userName");

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// appointmentController.js

/*const getAppointmentsnew = async (req, res) => {
  try {
    const { status } = req.query; // Fetch status from query parameter

    // If no status is provided, fetch all appointments
    const filter = status ? { status } : {};

    const appointments = await Appointment.find(filter)
      .populate("userId", "name email")
      .populate("tech", "employee_id technician_id department fullName")
      .populate("sconfirmedBy", "fullName userName")
      .lean();

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};*/

// 3️ Update workload for an appointment (Supervisor updates workload)
const updateWorkload = async (req, res) => {
  // Expecting an array of objects
  const { workload } = req.body;
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

    res.json({ message: "Suggestion updated successfully", appointment });
  } catch (error) {
    console.error("Error:", error.message);
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
const getCountAnalyse = async (req, res) => {
  try {
    const total = await Appointment.countDocuments();
    const pending = await Appointment.countDocuments({ status: "Pending" });
    const confirmed = await Appointment.countDocuments({ status: "Confirmed" });
    const checking = await Appointment.countDocuments({ status: "Checking" });
    const cancelled = await Appointment.countDocuments({ status: "Cancelled" });
    const rejected = await Appointment.countDocuments({ status: "Reject2" }); // or Reject2 based on your requirement
    const accepted = await Appointment.countDocuments({ status: "Accepted" });
    const inProgress = await Appointment.countDocuments({
      status: "InProgress",
    });
    const waiting = await Appointment.countDocuments({
      status: "Waiting for Technician Confirmation",
    });
    const taskDone = await Appointment.countDocuments({ status: "Task Done" });
    const paid = await Appointment.countDocuments({ status: "Paid" });

    res.json({
      total,
      pending,
      confirmed,
      checking,
      cancelled,
      rejected,
      inProgress,
      accepted,
      inProgress,
      waiting,
      taskDone,
      paid,
    });
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

const upadateWorkloadStatus = async (req, res) => {
  try {
    const { appointmentId, taskId } = req.params;
    const { status } = req.body;

    // Validate the appointmentId and taskId
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ message: "Invalid appointment ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    // Validate the status data
    const validStatuses = ["Pending", "In Progress", "Completed"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message:
          "Invalid status, valid values are: Pending, In Progress, Completed",
      });
    }

    // Fetch the appointment by appointmentId
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Find the task within the workload array
    const taskIndex = appointment.workload.findIndex(
      (task) => task._id.toString() === taskId
    );
    if (taskIndex === -1) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Update the task status
    appointment.workload[taskIndex].status = status;

    // Save the updated appointment
    const updatedAppointment = await appointment.save();

    // Return the updated appointment
    res.status(200).json({
      message: "Workload step status updated successfully",
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("Error updating workload status:", error);
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};
const getTechnicianAppointmentCount = async (req, res) => {
  try {
    // Perform aggregation to count appointments grouped by technician
    const technicianAppointments = await Appointment.aggregate([
      { $group: { _id: "$tech", count: { $sum: 1 } } }, // Group by technician and count appointments
      {
        $lookup: {
          from: "technicians", // Join with the technicians collection
          localField: "_id", // Technician ID in the appointments collection
          foreignField: "_id", // Technician ID in the technicians collection
          as: "technicianDetails", // Name of the array containing technician info
        },
      },
      { $unwind: "$technicianDetails" }, // Flatten the technician details
      {
        $project: {
          _id: 0,
          technicianId: "$technicianDetails.technician_id", // Technician ID
          department: "$technicianDetails.department", // Technician Department
          count: 1, // Appointment count
        },
      },
    ]);

    if (technicianAppointments.length === 0) {
      return res
        .status(404)
        .json({ message: "No appointments found for technicians" });
    }

    res.status(200).json({ technicianAppointments });
  } catch (error) {
    console.error("Error fetching technician appointment counts:", error);
    res
      .status(500)
      .json({ message: "Error fetching technician appointment counts" });
  }
};
// appointmentController.js
const updateAppointmentDetails = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { preferredDate, preferredTime, expectedDeliveryDate } = req.body;

    if (!preferredDate || !preferredTime || !expectedDeliveryDate) {
      return res.status(400).json({ message: "All date fields are required" });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.preferredDate = new Date(preferredDate);
    appointment.preferredTime = preferredTime;
    appointment.expectedDeliveryDate = new Date(expectedDeliveryDate);

    await appointment.save();

    res.status(200).json({
      message: "Appointment details updated successfully",
      appointment,
    });
  } catch (error) {
    console.error("Error updating appointment details:", error);
    res.status(500).json({ error: error.message });
  }
};

const getDepartmentStatusData = async (req, res) => {
  try {
    // Step 1: Perform aggregation to group by department and status
    const appointmentData = await Appointment.aggregate([
      {
        $lookup: {
          from: "technicians", // Join with the technicians collection
          localField: "tech", // Appointment's tech field
          foreignField: "_id", // Technician's _id field
          as: "technicianDetails",
        },
      },
      {
        $unwind: "$technicianDetails", // Flatten the technician details array
      },
      {
        $group: {
          _id: {
            department: "$technicianDetails.department",
            status: "$status",
          },
          count: { $sum: 1 }, // Count the number of appointments
        },
      },
      {
        $project: {
          department: "$_id.department",
          status: "$_id.status",
          count: 1,
          _id: 0, // Remove the _id field
        },
      },
      {
        $sort: { department: 1, status: 1 }, // Sort by department and status
      },
    ]);
    // Step 2: Initialize all possible statuses for each department
    const statusTypes = [
      "confirmed",
      "reject1",
      "waiting",
      "accepted",
      "reject2",
      "inprogress",
      "task done", // Exact match for "Task Done"
      "cancelled", // Added "Cancelled" for matching
      "paid", // Added "Paid" for matching
      "waiting for technician confirmation", // Added the exact status
      "all done", // Added "All done"
    ];

    const departmentStatusData = [];
    const departments = [
      ...new Set(appointmentData.map((item) => item.department)),
    ]; // Get unique departments

    departments.forEach((department) => {
      // Initialize the statusCounts for each department with 0 for all statuses
      const statusCounts = {
        confirmed: 0,
        reject1: 0,
        waiting: 0,
        accepted: 0,
        reject2: 0,
        inprogress: 0,
        "task done": 0, // Match exactly with DB value
        cancelled: 0, // Added cancelled status
        paid: 0, // Added paid status
        "waiting for technician confirmation": 0, // Added status for waiting for tech confirmation
        "all done": 0, // Added "All done" status
      };

      // Fill in the status counts for the department
      appointmentData.forEach((item) => {
        if (item.department === department) {
          const status = item.status ? item.status.trim().toLowerCase() : ""; // Normalize status

          // Check if the status is in the statusTypes array and update count
          if (statusCounts.hasOwnProperty(status)) {
            statusCounts[status] += item.count; // Increment count
          }
        }
      });

      // Push the department's status counts into the result
      departmentStatusData.push({
        department,
        statusCounts,
      });
    });

    // Step 3: Send the complete department status data as response
    res.status(200).json(departmentStatusData);
  } catch (error) {
    console.error("Error fetching department status data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//chamod
module.exports = {
  createAppointment,
  getUserAppointments,
  getAppointments,
  // getAppointmentsnew,
  updateWorkload,
  fetchApppintmetDetails,
  getWorkload,
  suggestionWrite,
  getCount,
  getCountAnalyse,
  getAssigned,
  getTechMessage,
  upadateWorkloadStatus,
  getTechnicianAppointmentCount,
  updateAppointmentDetails,
  getDepartmentStatusData,
  fetchApppintmetDetailsmanger,
};
