const Budget = require("../models/Budget");
const Appointment = require("../models/Appointment");
const mongoose = require("mongoose");

// GET: Fetch Budget Details (Steps, Description, Amounts)
const getBudgetDetails = async(req, res) => {
    const { appid } = req.params;

    if (!mongoose.isValidObjectId(appid)) {
        return res.status(400).json({ message: "Invalid appointment ID format" });
    }
    const appointmentId = appid;
    try {
        const budget = await Budget.findOne({ appointmentId });

        if (!budget) {
            return res.status(404).json({ message: "Budget not found for this appointment" });
        }

        res.status(200).json(budget);
    } catch (error) {
        console.error("Error fetching budget:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// POST: Update Amount for a Specific Workload Step in Budget
const updateBudgetAmount = async(req, res) => {
    const { appid } = req.params;
    const { step, amount, des } = req.body;

    if (!mongoose.isValidObjectId(appid)) {
        return res.status(400).json({ message: "Invalid appointment ID format" });
    }

    if (typeof step !== "number" || typeof amount !== "number") {
        return res.status(400).json({ message: "Step and amount must be valid numbers" });
    }

    try {
        const budget = await Budget.findOne({ appointmentId: appid });

        if (!budget) {
            return res.status(404).json({ message: "Budget not found for this appointment" });
        }

        // Find existing step
        const allocation = budget.amountAllocations.find((item) => item.step === step);

        if (allocation) {
            // Update existing step
            allocation.amount = amount;
            allocation.des = des || allocation.des; // if description provided, update it
        } else {
            // Add new step
            budget.amountAllocations.push({
                step,
                des: des || `Step ${step}`, // default description if not provided
                amount,
            });
        }

        // Recalculate totalAmount
        budget.totalAmount = budget.amountAllocations.reduce(
            (sum, item) => sum + item.amount,
            0
        );

        await budget.save();

        res.status(200).json({
            message: allocation ?
                `Step ${step} updated successfully` :
                `Step ${step} added successfully`,
            budget,
        });
    } catch (error) {
        console.error("Error updating/adding budget:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { getBudgetDetails, updateBudgetAmount };