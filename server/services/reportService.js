const salesPipelineRepo = require("../data/reports/salesPipelineReportRepo");
const revenueForecastRepo = require("../data/reports/revenueForecastReportRepo");
const closedDealsRepo = require("../data/reports/closedDealsReportRepo");
const customerSegmentationRepo = require("../data/reports/customerSegmentReportRepo");
const activitiesOutcomesRepo = require("../data/reports/activitiesOutcomesReportRepo");

// ==============================
// SALES PIPELINE REPORT FUNCTIONS
// ==============================

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

// ==============================
// REVENUE REPORT FUNCTIONS
// ==============================

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

// ==============================
// CLOSED DEALS REPORT FUNCTIONS
// ==============================

// Get Closed Deals Report by Period
async function getClosedDealsByPeriodReport(stageName = 'Closed Won', startDate = null, endDate = null) {
  try {
    const rawData = await closedDealsRepo.getClosedDealsByPeriod(stageName, startDate, endDate);
    
    // Transform the data for better frontend consumption
    const transformedData = rawData.map(period => ({
      period: period.Period, // Format: 'yyyy-MM' (e.g., '2025-01')
      periodFormatted: formatPeriod(period.Period), // Format: 'Jan 2025'
      totalRevenue: parseFloat(period.TotalRevenue) || 0,
      formattedTotalRevenue: formatCurrency(period.TotalRevenue || 0)
    }));
    
    // Calculate summary statistics
    const summary = {
      totalRevenue: transformedData.reduce((sum, period) => sum + period.totalRevenue, 0),
      periodCount: transformedData.length,
      averageMonthlyRevenue: transformedData.length > 0 ? 
        transformedData.reduce((sum, period) => sum + period.totalRevenue, 0) / transformedData.length : 0,
      highestMonth: transformedData.length > 0 ? 
        transformedData.reduce((prev, current) => (prev.totalRevenue > current.totalRevenue) ? prev : current) : null
    };
    
    return {
      data: transformedData,
      summary: {
        ...summary,
        formattedTotalRevenue: formatCurrency(summary.totalRevenue),
        formattedAverageMonthlyRevenue: formatCurrency(summary.averageMonthlyRevenue),
        highestMonth: summary.highestMonth ? {
          ...summary.highestMonth,
          formattedTotalRevenue: formatCurrency(summary.highestMonth.totalRevenue)
        } : null
      },
      filters: {
        stageName,
        startDate,
        endDate
      },
      chartData: {
        labels: transformedData.map(period => period.periodFormatted),
        revenue: transformedData.map(period => period.totalRevenue)
      }
    };
  } catch (error) {
    console.error("Error in getClosedDealsByPeriodReport service:", error);
    throw error;
  }
}

// Get Closed Deals Report by Account
async function getClosedDealsByAccountReport(stageName = 'Closed Won', startDate = null, endDate = null) {
  try {
    const rawData = await closedDealsRepo.getClosedDealsByAccount(stageName, startDate, endDate);
    
    // Transform the data for better frontend consumption
    const transformedData = rawData.map(account => ({
      accountId: account.AccountID,
      accountName: account.AccountName,
      totalRevenue: parseFloat(account.TotalRevenue) || 0,
      formattedTotalRevenue: formatCurrency(account.TotalRevenue || 0)
    }));
    
    // Calculate summary statistics
    const summary = {
      totalRevenue: transformedData.reduce((sum, account) => sum + account.totalRevenue, 0),
      accountCount: transformedData.length,
      averageRevenuePerAccount: transformedData.length > 0 ? 
        transformedData.reduce((sum, account) => sum + account.totalRevenue, 0) / transformedData.length : 0,
      topAccount: transformedData.length > 0 ? transformedData[0] : null // Already sorted by TotalRevenue DESC
    };
    
    return {
      data: transformedData,
      summary: {
        ...summary,
        formattedTotalRevenue: formatCurrency(summary.totalRevenue),
        formattedAverageRevenuePerAccount: formatCurrency(summary.averageRevenuePerAccount),
        topAccount: summary.topAccount ? {
          ...summary.topAccount,
          formattedTotalRevenue: formatCurrency(summary.topAccount.totalRevenue)
        } : null
      },
      filters: {
        stageName,
        startDate,
        endDate
      },
      chartData: {
        labels: transformedData.map(account => account.accountName),
        revenue: transformedData.map(account => account.totalRevenue)
      }
    };
  } catch (error) {
    console.error("Error in getClosedDealsByAccountReport service:", error);
    throw error;
  }
}

// Get Closed Deals Report by Role
async function getClosedDealsByRoleReport(stageName = 'Closed Won', roleName = 'Sales Representative', startDate = null, endDate = null) {
  try {
    const rawData = await closedDealsRepo.getClosedDealsByRole(stageName, roleName, startDate, endDate);
    
    // Transform the data for better frontend consumption
    const transformedData = rawData.map(deal => ({
      dealId: deal.DealID,
      dealName: deal.DealName,
      accountName: deal.AccountName,
      salesRep: deal.SalesRep,
      value: parseFloat(deal.Value) || 0,
      closeDate: deal.CloseDate,
      period: deal.Period,
      periodFormatted: formatPeriod(deal.Period),
      formattedValue: formatCurrency(deal.Value || 0)
    }));
    
    // Group by sales rep for summary
    const repSummary = transformedData.reduce((acc, deal) => {
      const rep = deal.salesRep || 'Unassigned';
      if (!acc[rep]) {
        acc[rep] = {
          salesRep: rep,
          dealCount: 0,
          totalRevenue: 0
        };
      }
      acc[rep].dealCount += 1;
      acc[rep].totalRevenue += deal.value;
      return acc;
    }, {});
    
    const repSummaryArray = Object.values(repSummary).map(rep => ({
      ...rep,
      formattedTotalRevenue: formatCurrency(rep.totalRevenue),
      averageDealValue: rep.dealCount > 0 ? rep.totalRevenue / rep.dealCount : 0,
      formattedAverageDealValue: formatCurrency(rep.dealCount > 0 ? rep.totalRevenue / rep.dealCount : 0)
    })).sort((a, b) => b.totalRevenue - a.totalRevenue);
    
    // Calculate summary statistics
    const summary = {
      totalDeals: transformedData.length,
      totalRevenue: transformedData.reduce((sum, deal) => sum + deal.value, 0),
      salesRepCount: repSummaryArray.length,
      averageDealValue: transformedData.length > 0 ? 
        transformedData.reduce((sum, deal) => sum + deal.value, 0) / transformedData.length : 0,
      topPerformer: repSummaryArray.length > 0 ? repSummaryArray[0] : null
    };
    
    return {
      data: transformedData,
      repSummary: repSummaryArray,
      summary: {
        ...summary,
        formattedTotalRevenue: formatCurrency(summary.totalRevenue),
        formattedAverageDealValue: formatCurrency(summary.averageDealValue)
      },
      filters: {
        stageName,
        roleName,
        startDate,
        endDate
      }
    };
  } catch (error) {
    console.error("Error in getClosedDealsByRoleReport service:", error);
    throw error;
  }
}

// Get Closed Deals Report by Team
async function getClosedDealsByTeamReport(stageName = 'Closed Won', startDate = null, endDate = null) {
  try {
    const rawData = await closedDealsRepo.getClosedDealsByTeam(stageName, startDate, endDate);
    
    // Transform the data for better frontend consumption
    const transformedData = rawData.map(deal => ({
      dealId: deal.DealID,
      dealName: deal.DealName,
      accountName: deal.AccountName,
      teamName: deal.TeamName || 'Unassigned',
      value: parseFloat(deal.Value) || 0,
      closeDate: deal.CloseDate,
      period: deal.Period,
      periodFormatted: formatPeriod(deal.Period),
      formattedValue: formatCurrency(deal.Value || 0)
    }));
    
    // Group by team for summary
    const teamSummary = transformedData.reduce((acc, deal) => {
      const team = deal.teamName;
      if (!acc[team]) {
        acc[team] = {
          teamName: team,
          dealCount: 0,
          totalRevenue: 0
        };
      }
      acc[team].dealCount += 1;
      acc[team].totalRevenue += deal.value;
      return acc;
    }, {});
    
    const teamSummaryArray = Object.values(teamSummary).map(team => ({
      ...team,
      formattedTotalRevenue: formatCurrency(team.totalRevenue),
      averageDealValue: team.dealCount > 0 ? team.totalRevenue / team.dealCount : 0,
      formattedAverageDealValue: formatCurrency(team.dealCount > 0 ? team.totalRevenue / team.dealCount : 0)
    })).sort((a, b) => b.totalRevenue - a.totalRevenue);
    
    // Calculate summary statistics
    const summary = {
      totalDeals: transformedData.length,
      totalRevenue: transformedData.reduce((sum, deal) => sum + deal.value, 0),
      teamCount: teamSummaryArray.length,
      averageDealValue: transformedData.length > 0 ? 
        transformedData.reduce((sum, deal) => sum + deal.value, 0) / transformedData.length : 0,
      topTeam: teamSummaryArray.length > 0 ? teamSummaryArray[0] : null
    };
    
    return {
      data: transformedData,
      teamSummary: teamSummaryArray,
      summary: {
        ...summary,
        formattedTotalRevenue: formatCurrency(summary.totalRevenue),
        formattedAverageDealValue: formatCurrency(summary.averageDealValue)
      },
      filters: {
        stageName,
        startDate,
        endDate
      },
      chartData: {
        labels: teamSummaryArray.map(team => team.teamName),
        revenue: teamSummaryArray.map(team => team.totalRevenue)
      }
    };
  } catch (error) {
    console.error("Error in getClosedDealsByTeamReport service:", error);
    throw error;
  }
}

// Get Closed Deals Report by Product
async function getClosedDealsByProductReport(stageName = 'Closed Won', startDate = null, endDate = null) {
  try {
    const rawData = await closedDealsRepo.getClosedDealsByProduct(stageName, startDate, endDate);
    
    // Transform the data for better frontend consumption
    const transformedData = rawData.map(product => ({
      productId: product.ProductID,
      productName: product.ProductName,
      sku: product.SKU,
      dealCount: parseInt(product.DealCount) || 0,
      totalRevenue: parseFloat(product.TotalRevenue) || 0,
      period: product.Period,
      periodFormatted: formatPeriod(product.Period),
      formattedTotalRevenue: formatCurrency(product.TotalRevenue || 0),
      averageDealValue: parseInt(product.DealCount) > 0 ? 
        parseFloat(product.TotalRevenue) / parseInt(product.DealCount) : 0
    }));
    
    // Add formatted average deal value
    transformedData.forEach(product => {
      product.formattedAverageDealValue = formatCurrency(product.averageDealValue);
    });
    
    // Group by product for overall summary (across all periods)
    const productSummary = transformedData.reduce((acc, item) => {
      const productKey = `${item.productId}-${item.productName}`;
      if (!acc[productKey]) {
        acc[productKey] = {
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          totalDealCount: 0,
          totalRevenue: 0
        };
      }
      acc[productKey].totalDealCount += item.dealCount;
      acc[productKey].totalRevenue += item.totalRevenue;
      return acc;
    }, {});
    
    const productSummaryArray = Object.values(productSummary).map(product => ({
      ...product,
      formattedTotalRevenue: formatCurrency(product.totalRevenue),
      averageDealValue: product.totalDealCount > 0 ? product.totalRevenue / product.totalDealCount : 0,
      formattedAverageDealValue: formatCurrency(product.totalDealCount > 0 ? product.totalRevenue / product.totalDealCount : 0)
    })).sort((a, b) => b.totalRevenue - a.totalRevenue);
    
    // Calculate summary statistics
    const summary = {
      totalDeals: transformedData.reduce((sum, item) => sum + item.dealCount, 0),
      totalRevenue: transformedData.reduce((sum, item) => sum + item.totalRevenue, 0),
      productCount: productSummaryArray.length,
      averageDealValue: transformedData.reduce((sum, item) => sum + item.dealCount, 0) > 0 ? 
        transformedData.reduce((sum, item) => sum + item.totalRevenue, 0) / transformedData.reduce((sum, item) => sum + item.dealCount, 0) : 0,
      topProduct: productSummaryArray.length > 0 ? productSummaryArray[0] : null
    };
    
    return {
      data: transformedData,
      productSummary: productSummaryArray,
      summary: {
        ...summary,
        formattedTotalRevenue: formatCurrency(summary.totalRevenue),
        formattedAverageDealValue: formatCurrency(summary.averageDealValue)
      },
      filters: {
        stageName,
        startDate,
        endDate
      },
      chartData: {
        labels: productSummaryArray.map(product => product.productName),
        revenue: productSummaryArray.map(product => product.totalRevenue),
        dealCount: productSummaryArray.map(product => product.totalDealCount)
      }
    };
  } catch (error) {
    console.error("Error in getClosedDealsByProductReport service:", error);
    throw error;
  }
}

// ==============================
// CUSTOMER SEGMENTATION REPORT FUNCTIONS
// ==============================

// Get Customer Segmentation Report
async function getCustomerSegmentationReport(segmentType = 'Industry') {
  try {
    const rawData = await customerSegmentationRepo.getCustomerSegmentation(segmentType);
    
    // Transform the data for better frontend consumption
    const transformedData = rawData.map(segment => ({
      segment: segment.Segment || 'Unknown',
      customerCount: parseInt(segment.CustomerCount) || 0,
      percentage: 0 // Will be calculated below
    }));
    
    // Calculate total customers for percentage calculation
    const totalCustomers = transformedData.reduce((sum, segment) => sum + segment.customerCount, 0);
    
    // Add percentage calculation
    transformedData.forEach(segment => {
      segment.percentage = totalCustomers > 0 ? (segment.customerCount / totalCustomers) * 100 : 0;
      segment.formattedPercentage = `${segment.percentage.toFixed(1)}%`;
    });
    
    // Sort by customer count (descending)
    transformedData.sort((a, b) => b.customerCount - a.customerCount);
    
    // Calculate summary statistics
    const summary = {
      totalCustomers: totalCustomers,
      segmentCount: transformedData.length,
      largestSegment: transformedData.length > 0 ? transformedData[0] : null,
      smallestSegment: transformedData.length > 0 ? transformedData[transformedData.length - 1] : null,
      averageCustomersPerSegment: transformedData.length > 0 ? 
        totalCustomers / transformedData.length : 0
    };
    
    return {
      data: transformedData,
      summary: {
        ...summary,
        formattedAverageCustomersPerSegment: Math.round(summary.averageCustomersPerSegment),
        largestSegment: summary.largestSegment ? {
          ...summary.largestSegment,
          formattedPercentage: `${summary.largestSegment.percentage.toFixed(1)}%`
        } : null,
        smallestSegment: summary.smallestSegment ? {
          ...summary.smallestSegment,
          formattedPercentage: `${summary.smallestSegment.percentage.toFixed(1)}%`
        } : null
      },
      filters: {
        segmentType
      },
      chartData: {
        labels: transformedData.map(segment => segment.segment),
        customerCounts: transformedData.map(segment => segment.customerCount),
        percentages: transformedData.map(segment => segment.percentage)
      },
      segmentTypeInfo: getSegmentTypeInfo(segmentType)
    };
  } catch (error) {
    console.error("Error in getCustomerSegmentationReport service:", error);
    throw error;
  }
}

// Helper function to provide information about segment types
function getSegmentTypeInfo(segmentType) {
  const segmentTypes = {
    'Industry': {
      description: 'Segments customers by industry vertical',
      useCase: 'Industry-specific marketing campaigns and product development',
      visualization: 'Pie chart or horizontal bar chart'
    },
    'Size': {
      description: 'Segments customers by company size (employee count)',
      categories: ['Small (1-49)', 'Medium (50-250)', 'Large (251+)'],
      useCase: 'Tailoring pricing strategies and sales approaches',
      visualization: 'Pie chart or donut chart'
    },
    'Country': {
      description: 'Segments customers by country location',
      useCase: 'Geographic expansion planning and regional marketing',
      visualization: 'World map heatmap or bar chart'
    },
    'StateProvince': {
      description: 'Segments customers by state or province',
      useCase: 'Regional sales territory optimization',
      visualization: 'Regional map or bar chart'
    },
    'City': {
      description: 'Segments customers by city location',
      useCase: 'Local marketing campaigns and sales territory planning',
      visualization: 'City-level map or top cities bar chart'
    }
  };
  
  return segmentTypes[segmentType] || {
    description: 'Custom customer segmentation',
    useCase: 'Targeted marketing and sales strategies',
    visualization: 'Chart based on data distribution'
  };
}

// Get Activities vs Outcomes Report
async function getActivitiesVsOutcomesReport() {
  try {
    const rawData = await activitiesOutcomesRepo.getActivitiesVsOutcomes();
    
    // Transform the data for better frontend consumption
    const transformedData = rawData.map(item => ({
      activityType: item.ActivityType || 'Unknown',
      outcome: item.Outcome || 'No Outcome',
      activityCount: parseInt(item.ActivityCount) || 0
    }));
    
    // Group data by activity type for summary
    const activitySummary = transformedData.reduce((acc, item) => {
      const activityType = item.activityType;
      if (!acc[activityType]) {
        acc[activityType] = {
          activityType: activityType,
          totalActivities: 0,
          outcomes: {}
        };
      }
      acc[activityType].totalActivities += item.activityCount;
      acc[activityType].outcomes[item.outcome] = item.activityCount;
      return acc;
    }, {});
    
    const activitySummaryArray = Object.values(activitySummary);
    
    // Group data by outcome for outcome summary
    const outcomeSummary = transformedData.reduce((acc, item) => {
      const outcome = item.outcome;
      if (!acc[outcome]) {
        acc[outcome] = {
          outcome: outcome,
          totalActivities: 0,
          activityTypes: {}
        };
      }
      acc[outcome].totalActivities += item.activityCount;
      acc[outcome].activityTypes[item.activityType] = item.activityCount;
      return acc;
    }, {});
    
    const outcomeSummaryArray = Object.values(outcomeSummary).sort((a, b) => b.totalActivities - a.totalActivities);
    
    // Calculate conversion metrics
    const conversionMetrics = activitySummaryArray.map(activity => {
      const outcomes = activity.outcomes;
      const totalActivities = activity.totalActivities;
      
      // Calculate conversion rates for positive outcomes
      const positiveOutcomes = ['Closed Won', 'Qualified', 'Proposal', 'Negotiation'];
      const positiveActivityCount = positiveOutcomes.reduce((sum, outcome) => {
        return sum + (outcomes[outcome] || 0);
      }, 0);
      
      const conversionRate = totalActivities > 0 ? (positiveActivityCount / totalActivities) * 100 : 0;
      
      return {
        activityType: activity.activityType,
        totalActivities: totalActivities,
        positiveOutcomes: positiveActivityCount,
        conversionRate: conversionRate,
        formattedConversionRate: `${conversionRate.toFixed(1)}%`,
        outcomes: outcomes
      };
    }).sort((a, b) => b.conversionRate - a.conversionRate);
    
    // Get unique activity types and outcomes for chart data
    const activityTypes = [...new Set(transformedData.map(item => item.activityType))];
    const outcomes = [...new Set(transformedData.map(item => item.outcome))];
    
    // Create chart data structure
    const chartData = {
      labels: activityTypes,
      datasets: outcomes.map(outcome => ({
        label: outcome,
        data: activityTypes.map(activityType => {
          const item = transformedData.find(d => d.activityType === activityType && d.outcome === outcome);
          return item ? item.activityCount : 0;
        })
      }))
    };
    
    // Create heatmap data for activity type vs outcome
    const heatmapData = activityTypes.map(activityType => {
      return outcomes.map(outcome => {
        const item = transformedData.find(d => d.activityType === activityType && d.outcome === outcome);
        return {
          x: activityType,
          y: outcome,
          value: item ? item.activityCount : 0
        };
      });
    }).flat();
    
    // Calculate summary statistics
    const summary = {
      totalActivities: transformedData.reduce((sum, item) => sum + item.activityCount, 0),
      activityTypeCount: activityTypes.length,
      outcomeCount: outcomes.length,
      averageActivitiesPerType: activityTypes.length > 0 ? 
        transformedData.reduce((sum, item) => sum + item.activityCount, 0) / activityTypes.length : 0,
      topActivityType: activitySummaryArray.length > 0 ? 
        activitySummaryArray.reduce((prev, current) => (prev.totalActivities > current.totalActivities) ? prev : current) : null,
      topOutcome: outcomeSummaryArray.length > 0 ? outcomeSummaryArray[0] : null,
      bestConversionRate: conversionMetrics.length > 0 ? conversionMetrics[0] : null
    };
    
    return {
      data: transformedData,
      activitySummary: activitySummaryArray,
      outcomeSummary: outcomeSummaryArray,
      conversionMetrics: conversionMetrics,
      summary: {
        ...summary,
        formattedAverageActivitiesPerType: Math.round(summary.averageActivitiesPerType)
      },
      chartData: chartData,
      heatmapData: heatmapData,
      metadata: {
        activityTypes: activityTypes,
        outcomes: outcomes,
        reportType: 'Activities vs Outcomes',
        description: 'Compares sales rep activities (calls, emails, meetings) to outcomes (deals closed, conversions)',
        visualizationSuggestions: [
          'Stacked Bar Chart - Activities by Outcome',
          'Grouped Bar Chart - Outcomes by Activity Type', 
          'Heatmap - Activity Type vs Outcome',
          'Conversion Rate Chart - Activity Types Ranked by Success Rate'
        ]
      }
    };
  } catch (error) {
    console.error("Error in getActivitiesVsOutcomesReport service:", error);
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
  getClosedDealsByPeriodReport,
  getClosedDealsByAccountReport,
  getClosedDealsByRoleReport,
  getClosedDealsByTeamReport,
  getClosedDealsByProductReport,
  getCustomerSegmentationReport,
  getActivitiesVsOutcomesReport,
};