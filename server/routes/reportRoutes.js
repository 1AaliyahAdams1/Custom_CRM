
const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

// ==============================
// SALES PIPELINE REPORT ROUTE
// ==============================

// Sales Pipeline Report route
router.get("/sales-pipeline", reportController.getSalesPipelineReport);

// ==============================
// REVENUE FORECAST REPORT ROUTE
// ==============================

// Revenue Forecast Report route
router.get("/revenue-forecast", reportController.getRevenueForecastReport);

// ==============================
// CLOSED DEALS REPORT ROUTES
// ==============================

// Closed Deals Report by Period route
router.get("/closed-deals/by-period", reportController.getClosedDealsByPeriodReport);

// Closed Deals Report by Account route
router.get("/closed-deals/by-account", reportController.getClosedDealsByAccountReport);

// Closed Deals Report by Role route
router.get("/closed-deals/by-role", reportController.getClosedDealsByRoleReport);

// Closed Deals Report by Team route
router.get("/closed-deals/by-team", reportController.getClosedDealsByTeamReport);

// Closed Deals Report by Product route
router.get("/closed-deals/by-product", reportController.getClosedDealsByProductReport);

module.exports = router;