const reportService = require("../services/reportService");

// ==============================
// SALES PIPELINE REPORT CONTROLLERS
// ==============================

// Get Sales Pipeline Report
async function getSalesPipelineReport(req, res) {
  try {
    const { startDate, endDate } = req.query;
    
    // Validate date format if provided
    if (startDate && !isValidDate(startDate)) {
      return res.status(400).json({ error: "Invalid startDate format. Use YYYY-MM-DD" });
    }
    if (endDate && !isValidDate(endDate)) {
      return res.status(400).json({ error: "Invalid endDate format. Use YYYY-MM-DD" });
    }
    
    const pipelineData = await reportService.getSalesPipelineReport(startDate, endDate);
    res.json(pipelineData);
  } catch (err) {
    console.error("Error getting sales pipeline report:", err.message, err.stack);
    res.status(500).json({ error: "Failed to get sales pipeline report" });
  }
}

// ==============================
// REVENUE FORECAST REPORT CONTROLLERS
// ==============================

// Get Revenue Forecast Report
async function getRevenueForecastReport(req, res) {
  try {
    const { startDate, endDate, stageName } = req.query;
    
    // Validate date format if provided
    if (startDate && !isValidDate(startDate)) {
      return res.status(400).json({ error: "Invalid startDate format. Use YYYY-MM-DD" });
    }
    if (endDate && !isValidDate(endDate)) {
      return res.status(400).json({ error: "Invalid endDate format. Use YYYY-MM-DD" });
    }
    
    // Use 'Closed Won' as default stageName if not provided
    const stageNameToUse = stageName || 'Closed Won';
    
    const forecastData = await reportService.getRevenueForecastReport(startDate, endDate, stageNameToUse);
    res.json(forecastData);
    
  } catch (err) {
    console.error("Error getting revenue forecast report:", err.message, err.stack);
    res.status(500).json({ error: "Failed to get revenue forecast report" });
  }
}

// ==============================
// CLOSED DEALS REPORT CONTROLLERS
// ==============================

// Get Closed Deals Report by Period
async function getClosedDealsByPeriodReport(req, res) {
  try {
    const { startDate, endDate, stageName } = req.query;
    
    // Validate date format if provided
    if (startDate && !isValidDate(startDate)) {
      return res.status(400).json({ error: "Invalid startDate format. Use YYYY-MM-DD" });
    }
    if (endDate && !isValidDate(endDate)) {
      return res.status(400).json({ error: "Invalid endDate format. Use YYYY-MM-DD" });
    }
    
    // Use 'Closed Won' as default stageName if not provided
    const stageNameToUse = stageName || 'Closed Won';
    
    const closedDealsData = await reportService.getClosedDealsByPeriodReport(stageNameToUse, startDate, endDate);
    res.json(closedDealsData);
    
  } catch (err) {
    console.error("Error getting closed deals by period report:", err.message, err.stack);
    res.status(500).json({ error: "Failed to get closed deals by period report" });
  }
}

// Get Closed Deals Report by Account
async function getClosedDealsByAccountReport(req, res) {
  try {
    const { startDate, endDate, stageName } = req.query;
    
    // Validate date format if provided
    if (startDate && !isValidDate(startDate)) {
      return res.status(400).json({ error: "Invalid startDate format. Use YYYY-MM-DD" });
    }
    if (endDate && !isValidDate(endDate)) {
      return res.status(400).json({ error: "Invalid endDate format. Use YYYY-MM-DD" });
    }
    
    // Use 'Closed Won' as default stageName if not provided
    const stageNameToUse = stageName || 'Closed Won';
    
    const closedDealsData = await reportService.getClosedDealsByAccountReport(stageNameToUse, startDate, endDate);
    res.json(closedDealsData);
    
  } catch (err) {
    console.error("Error getting closed deals by account report:", err.message, err.stack);
    res.status(500).json({ error: "Failed to get closed deals by account report" });
  }
}

// Get Closed Deals Report by Role
async function getClosedDealsByRoleReport(req, res) {
  try {
    const { startDate, endDate, stageName, roleName } = req.query;
    
    // Validate date format if provided
    if (startDate && !isValidDate(startDate)) {
      return res.status(400).json({ error: "Invalid startDate format. Use YYYY-MM-DD" });
    }
    if (endDate && !isValidDate(endDate)) {
      return res.status(400).json({ error: "Invalid endDate format. Use YYYY-MM-DD" });
    }
    
    // Use defaults if not provided
    const stageNameToUse = stageName || 'Closed Won';
    const roleNameToUse = roleName || 'Sales Representative';
    
    const closedDealsData = await reportService.getClosedDealsByRoleReport(stageNameToUse, roleNameToUse, startDate, endDate);
    res.json(closedDealsData);
    
  } catch (err) {
    console.error("Error getting closed deals by role report:", err.message, err.stack);
    res.status(500).json({ error: "Failed to get closed deals by role report" });
  }
}

// Get Closed Deals Report by Team
async function getClosedDealsByTeamReport(req, res) {
  try {
    const { startDate, endDate, stageName } = req.query;
    
    // Validate date format if provided
    if (startDate && !isValidDate(startDate)) {
      return res.status(400).json({ error: "Invalid startDate format. Use YYYY-MM-DD" });
    }
    if (endDate && !isValidDate(endDate)) {
      return res.status(400).json({ error: "Invalid endDate format. Use YYYY-MM-DD" });
    }
    
    // Use 'Closed Won' as default stageName if not provided
    const stageNameToUse = stageName || 'Closed Won';
    
    const closedDealsData = await reportService.getClosedDealsByTeamReport(stageNameToUse, startDate, endDate);
    res.json(closedDealsData);
    
  } catch (err) {
    console.error("Error getting closed deals by team report:", err.message, err.stack);
    res.status(500).json({ error: "Failed to get closed deals by team report" });
  }
}

// Get Closed Deals Report by Product
async function getClosedDealsByProductReport(req, res) {
  try {
    const { startDate, endDate, stageName } = req.query;
    
    // Validate date format if provided
    if (startDate && !isValidDate(startDate)) {
      return res.status(400).json({ error: "Invalid startDate format. Use YYYY-MM-DD" });
    }
    if (endDate && !isValidDate(endDate)) {
      return res.status(400).json({ error: "Invalid endDate format. Use YYYY-MM-DD" });
    }
    
    // Use 'Closed Won' as default stageName if not provided
    const stageNameToUse = stageName || 'Closed Won';
    
    const closedDealsData = await reportService.getClosedDealsByProductReport(stageNameToUse, startDate, endDate);
    res.json(closedDealsData);
    
  } catch (err) {
    console.error("Error getting closed deals by product report:", err.message, err.stack);
    res.status(500).json({ error: "Failed to get closed deals by product report" });
  }
}

// ==============================
// CUSTOMER SEGMENTATION REPORT CONTROLLERS
// ==============================

// Get Customer Segmentation Report
async function getCustomerSegmentationReport(req, res) {
  try {
    const { segmentType } = req.query;
    
    // Validate segmentType if provided
    const validSegmentTypes = ['Industry', 'Size', 'Country', 'StateProvince', 'City'];
    if (segmentType && !validSegmentTypes.includes(segmentType)) {
      return res.status(400).json({ 
        error: `Invalid segmentType. Valid options are: ${validSegmentTypes.join(', ')}` 
      });
    }
    
    // Use 'Industry' as default segmentType if not provided
    const segmentTypeToUse = segmentType || 'Industry';
    
    const segmentationData = await reportService.getCustomerSegmentationReport(segmentTypeToUse);
    res.json(segmentationData);
    
  } catch (err) {
    console.error("Error getting customer segmentation report:", err.message, err.stack);
    res.status(500).json({ error: "Failed to get customer segmentation report" });
  }
}

// ==============================
// ACTIVITIES VS OUTCOMES REPORT CONTROLLERS
// ==============================

// Get Activities vs Outcomes Report
async function getActivitiesVsOutcomesReport(req, res) {
  try {
    const activitiesData = await reportService.getActivitiesVsOutcomesReport();
    res.json(activitiesData);
    
  } catch (err) {
    console.error("Error getting activities vs outcomes report:", err.message, err.stack);
    res.status(500).json({ error: "Failed to get activities vs outcomes report" });
  }
}

// Helper function to validate date format
function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date) && dateString === date.toISOString().split('T')[0];
}


module.exports = {
  getSalesPipelineReport,
  getRevenueForecastReport,
  getClosedDealsByPeriodReport,
  getClosedDealsByAccountReport,
  getClosedDealsByRoleReport,
  getClosedDealsByTeamReport,
  getClosedDealsByProductReport,
  getCustomerSegmentationReport,
  getActivitiesVsOutcomesReport,
};