const reportService = require("../services/reportService");

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

// Helper function to validate date format
function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date) && dateString === date.toISOString().split('T')[0];
}

module.exports = {
  getSalesPipelineReport,
};