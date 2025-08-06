
const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

// Sales Pipeline Report route
router.get("/sales-pipeline", reportController.getSalesPipelineReport);

module.exports = router;