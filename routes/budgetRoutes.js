const express = require("express");
const { getBudgetDetails, updateBudgetAmount } = require("../controllers/updateBudget.js");
const router = express.Router();

router.put("/:appid/update", updateBudgetAmount);
router.get("/:appid/view", getBudgetDetails);

module.exports = router;
