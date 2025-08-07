const salesPipelineRepo = require("../data/reports/salesPipelineReportRepo");
const revenueForecastRepo = require("../data/reports/revenueForecastReportRepo");

// Get Sales Pipeline Report
async function getSalesPipelineReport(startDate = null, endDate = null) {
  try {
    const rawData = await salesPipelineRepo.getSalesPipeline(startDate, endDate);
    
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

// Get Revenue Forecast Report
async function getRevenueForecastReport(startDate = null, endDate = null, stageName = 'Closed Won') {
  try {
    const rawData = await revenueForecastRepo.getRevenueForecast(startDate, endDate, stageName);
    
    // Transform the data for better frontend consumption
    const transformedData = rawData.map(period => ({
      period: period.Period, // Format: 'yyyy-MM' (e.g., '2025-01')
      periodFormatted: formatPeriod(period.Period), // Format: 'Jan 2025'
      actualRevenue: parseFloat(period.ActualRevenue) || 0,
      forecastRevenue: parseFloat(period.ForecastRevenue) || 0,
      totalRevenue: (parseFloat(period.ActualRevenue) || 0) + (parseFloat(period.ForecastRevenue) || 0),
      formattedActualRevenue: formatCurrency(period.ActualRevenue || 0),
      formattedForecastRevenue: formatCurrency(period.ForecastRevenue || 0),
      formattedTotalRevenue: formatCurrency((parseFloat(period.ActualRevenue) || 0) + (parseFloat(period.ForecastRevenue) || 0))
    }));
    
    // Calculate summary statistics
    const summary = {
      totalActualRevenue: transformedData.reduce((sum, period) => sum + period.actualRevenue, 0),
      totalForecastRevenue: transformedData.reduce((sum, period) => sum + period.forecastRevenue, 0),
      periodCount: transformedData.length,
      averageMonthlyActual: transformedData.length > 0 ? 
        transformedData.reduce((sum, period) => sum + period.actualRevenue, 0) / transformedData.length : 0,
      averageMonthlyForecast: transformedData.length > 0 ? 
        transformedData.reduce((sum, period) => sum + period.forecastRevenue, 0) / transformedData.length : 0
    };
    
    return {
      data: transformedData,
      summary: {
        ...summary,
        totalCombinedRevenue: summary.totalActualRevenue + summary.totalForecastRevenue,
        formattedTotalActualRevenue: formatCurrency(summary.totalActualRevenue),
        formattedTotalForecastRevenue: formatCurrency(summary.totalForecastRevenue),
        formattedTotalCombinedRevenue: formatCurrency(summary.totalActualRevenue + summary.totalForecastRevenue),
        formattedAverageMonthlyActual: formatCurrency(summary.averageMonthlyActual),
        formattedAverageMonthlyForecast: formatCurrency(summary.averageMonthlyForecast)
      },
      filters: {
        startDate,
        endDate,
        stageName
      },
      chartData: {
        labels: transformedData.map(period => period.periodFormatted),
        actualRevenue: transformedData.map(period => period.actualRevenue),
        forecastRevenue: transformedData.map(period => period.forecastRevenue),
        totalRevenue: transformedData.map(period => period.totalRevenue)
      }
    };
  } catch (error) {
    console.error("Error in getRevenueForecastReport service:", error);
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

// Helper function to format period (yyyy-MM to readable format)
function formatPeriod(period) {
  if (!period) return 'Unknown';
  
  const [year, month] = period.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short' 
  });
}

module.exports = {
  getSalesPipelineReport,
  getRevenueForecastReport,
};