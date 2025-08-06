const reportRepo = require("../data/reports/salesPipelineReportRepo");

// Get Sales Pipeline Report
async function getSalesPipelineReport(startDate = null, endDate = null) {
  try {
    const rawData = await reportRepo.getSalesPipeline(startDate, endDate);
    
    // Transform the data for better frontend consumption
    const transformedData = rawData.map(stage => ({
      stageId: stage.DealStageID,
      stageName: stage.StageName,
      dealCount: stage.DealCount,
      totalValue: parseFloat(stage.TotalValue) || 0,
      // Format totalValue for display (optional)
      formattedValue: formatCurrency(stage.TotalValue || 0)
    }));
    
    // Calculate summary statistics
    const summary = {
      totalDeals: transformedData.reduce((sum, stage) => sum + stage.dealCount, 0),
      totalValue: transformedData.reduce((sum, stage) => sum + stage.totalValue, 0),
      stageCount: transformedData.length
    };
    
    return {
      data: transformedData,
      summary: {
        ...summary,
        formattedTotalValue: formatCurrency(summary.totalValue)
      },
      filters: {
        startDate,
        endDate
      }
    };
  } catch (error) {
    console.error("Error in getSalesPipelineReport service:", error);
    throw error;
  }
}

// Helper function to format currency
function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
}

module.exports = {
  getSalesPipelineReport,
};