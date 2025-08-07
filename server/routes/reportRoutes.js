
const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

// Sales Pipeline Report route
router.get("/sales-pipeline", reportController.getSalesPipelineReport);
// Revenue Forecast Report route
router.get("/revenue-forecast", reportController.getRevenueForecastReport);

module.exports = router;