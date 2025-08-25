const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

router.get("/sales-pipeline", reportController.getSalesPipelineReport);
router.get("/revenue-forecast", reportController.getRevenueForecastReport);
router.get("/closed-deals/period", reportController.getClosedDealsByPeriodReport);
router.get("/closed-deals/account", reportController.getClosedDealsByAccountReport);
router.get("/closed-deals/role", reportController.getClosedDealsByRoleReport);
router.get("/closed-deals/team", reportController.getClosedDealsByTeamReport);
router.get("/closed-deals/product", reportController.getClosedDealsByProductReport);
router.get("/customer-segmentation", reportController.getCustomerSegmentationReport);
router.get("/activities-outcomes", reportController.getActivitiesVsOutcomesReport);

module.exports = router;