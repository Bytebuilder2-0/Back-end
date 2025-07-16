const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const Appointment = require("../models/Appointment");
const Budget = require("../models/Budget");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ POST /api/payment/create-checkout-session
router.post("/create-checkout-session", async (req, res) => {
	try {
		const { appointmentId } = req.body;
		console.log("Appointment ID received:", appointmentId);

		const appointment = await Appointment.findById(appointmentId).populate("budgetId");
		if (!appointment || !appointment.budgetId) {
			return res.status(404).json({ error: "Budget not found for this appointment" });
		}

		const budget = await Budget.findById(appointment.budgetId);
		if (!budget || !budget.amountAllocations.length) {
			return res.status(400).json({ error: "No amount allocations found in budget" });
		}

		// ✅ Convert budget items to Stripe line items
		const lineItems = budget.amountAllocations.map((item) => ({
			price_data: {
				currency: "lkr", // Change to your currency if needed
				product_data: {
					name: `Step ${item.step}: ${item.des}`,
				},
				unit_amount: Math.round(item.amount * 100), // Convert to cents
			},
			quantity: 1,
		}));

		console.log("Line Items Sent to Stripe:", lineItems);

		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: lineItems,
			mode: "payment",
			success_url: "http://localhost:5173/payment-success",
			cancel_url: "http://localhost:5173/payment-cancel",
		});

		res.json({ id: session.id });
	} catch (error) {
		console.error("Stripe Error:", error);
		res.status(500).json({ error: error.message });
	}
});

module.exports = router;
