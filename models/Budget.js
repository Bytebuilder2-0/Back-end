const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    amountAllocations: [
      {
        step: { type: Number, required: true }, // Matches workload step in Appointment
        des: { type: String, required: true },
        amount: { type: Number, default: 0 }, // Supervisor assigns this
      },
    ],
    totalAmount: { type: Number, default: 0 }, // Sum of all assigned amounts
  },
  { timestamps: true }
);

const Budget = mongoose.model("Budget", budgetSchema);
module.exports = Budget;
