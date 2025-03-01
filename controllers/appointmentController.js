const Appointment = require("../models/Appointment.js");
const mongoose = require("mongoose");
const Budget = require("../models/Budget.js");

// 1️⃣ Create a new appointment (Client submits form)
const createAppointment = async(req, res) => {
    try {
        // Step 1: Create a new appointment
        const newAppointment = new Appointment(req.body);
        await newAppointment.save();

        // Step 2: Create a linked budget (only references appointmentId)
        const newBudget = new Budget({
            appointmentId: newAppointment._id, // Link to appointment
            amountAllocations: newAppointment.workload.map((task) => ({
                step: task.step,
                des: task.description,
                amount: 0, // Default amount, supervisor updates later
            })),
            totalAmount: 0, // Starts at 0, gets updated later
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
        console.error("🚨 Error:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// 2️⃣ Get all appointments (Supervisor dashboard)
const getAppointments = async(req, res) => {
    try {
        const appointments = await Appointment.find({},
            "vehicleId vehicleNumber model issue workload tech status techMessage contactNumber"
        );
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3️⃣ Update workload for an appointment (Supervisor updates workload)
const updateWorkload = async(req, res) => {
    const { workload } = req.body; // Expecting an array of objects
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: "Invalid appointment ID format" });
    }

    try {
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

        // Update appointment workload
        appointment.workload = workload;
        await appointment.save();

        return res
            .status(200)
            .json({ message: "Workload updated successfully", appointment });
    } catch (error) {
        console.error("Error updating workload:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const suggestionWrite = async(req, res) => {
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

module.exports = {
    createAppointment,
    getAppointments,
    updateWorkload,

    getWorkload,
    suggestionWrite,
};