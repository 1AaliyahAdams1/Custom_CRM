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
    
    // Import the service functions
    const reportService = require("../services/reportService");
    
    // Get all data in parallel
    const [
      salesPipeline,
      revenueData,
      closedDealsData,
      customerSegments,
      activitiesData
    ] = await Promise.all([
      reportService.getSalesPipelineReport(startDate, endDate),
      reportService.getRevenueForecastReport(startDate, endDate),
      reportService.getClosedDealsByPeriodReport('Closed Won', startDate, endDate),
      reportService.getCustomerSegmentationReport('Industry'),
      reportService.getActivitiesVsOutcomesReport()
    ]);

    // Return structured dashboard data
    res.json({
      salesPipeline: {
        data: salesPipeline.data,
        summary: salesPipeline.summary
      },
      revenue: {
        data: revenueData.data,
        summary: revenueData.summary,
        chartData: revenueData.chartData
      },
      closedDeals: {
        data: closedDealsData.data,
        summary: closedDealsData.summary,
        chartData: closedDealsData.chartData
      },
      customers: {
        data: customerSegments.data,
        summary: customerSegments.summary,
        chartData: customerSegments.chartData
      },
      activities: {
        data: activitiesData.data,
        summary: activitiesData.summary,
        chartData: activitiesData.chartData
      },
      filters: { startDate, endDate },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ 
      error: 'Failed to get dashboard summary',
      details: error.message 
    });
  }
});

module.exports = router;