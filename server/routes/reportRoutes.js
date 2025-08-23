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
router.get('/dashboard-summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Get key metrics for dashboard
    const [
      salesPipeline,
      revenueData,
      closedDealsData,
      customerSegments,
      activitiesData
    ] = await Promise.all([
      reportController.getSalesPipelineReport({ query: { startDate, endDate } }, { json: data => data }),
      reportController.getRevenueForecastReport({ query: { startDate, endDate } }, { json: data => data }),
      reportController.getClosedDealsByPeriodReport({ query: { startDate, endDate } }, { json: data => data }),
      reportController.getCustomerSegmentationReport({ query: {} }, { json: data => data }),
      reportController.getActivitiesVsOutcomesReport({ query: {} }, { json: data => data })
    ]);

    res.json({
      salesPipeline: salesPipeline.summary,
      revenue: revenueData.summary,
      closedDeals: closedDealsData.summary,
      customers: customerSegments.summary,
      activities: activitiesData.summary,
      filters: { startDate, endDate },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ error: 'Failed to get dashboard summary' });
  }
});
module.exports = router;