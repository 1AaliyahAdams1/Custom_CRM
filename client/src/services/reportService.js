import api from "../utils/api";

const RESOURCE = "/reports";

const buildQueryParams = (filters = {}) => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      params.append(key, value);
    }
  });
  
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

// ==============================
// SALES PIPELINE REPORT
// ==============================

export const getSalesPipelineReport = async (filters = {}) => {
  try {
    const params = buildQueryParams(filters);
    const response = await api.get(`${RESOURCE}/sales-pipeline${params}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching sales pipeline report:", error);
    throw error;
  }
};

// ==============================
// REVENUE FORECAST REPORT
// ==============================

export const getRevenueForecastReport = async (filters = {}) => {
  try {
    const params = buildQueryParams(filters);
    const response = await api.get(`${RESOURCE}/revenue-forecast${params}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching revenue forecast report:", error);
    throw error;
  }
};

// ==============================
// CLOSED DEALS REPORTS
// ==============================

export const getClosedDealsByPeriodReport = async (filters = {}) => {
  try {
    const params = buildQueryParams(filters);
    const response = await api.get(`${RESOURCE}/closed-deals/by-period${params}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching closed deals by period report:", error);
    throw error;
  }
};

export const getClosedDealsByAccountReport = async (filters = {}) => {
  try {
    const params = buildQueryParams(filters);
    const response = await api.get(`${RESOURCE}/closed-deals/by-account${params}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching closed deals by account report:", error);
    throw error;
  }
};

export const getClosedDealsByRoleReport = async (filters = {}) => {
  try {
    const params = buildQueryParams(filters);
    const response = await api.get(`${RESOURCE}/closed-deals/by-role${params}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching closed deals by role report:", error);
    throw error;
  }
};

export const getClosedDealsByTeamReport = async (filters = {}) => {
  try {
    const params = buildQueryParams(filters);
    const response = await api.get(`${RESOURCE}/closed-deals/by-team${params}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching closed deals by team report:", error);
    throw error;
  }
};

export const getClosedDealsByProductReport = async (filters = {}) => {
  try {
    const params = buildQueryParams(filters);
    const response = await api.get(`${RESOURCE}/closed-deals/by-product${params}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching closed deals by product report:", error);
    throw error;
  }
};

// ==============================
// CUSTOMER SEGMENTATION REPORT
// ==============================

export const getCustomerSegmentationReport = async (filters = {}) => {
  try {
    const params = buildQueryParams(filters);
    const response = await api.get(`${RESOURCE}/customer-segmentation${params}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching customer segmentation report:", error);
    throw error;
  }
};

// ==============================
// ACTIVITIES VS OUTCOMES REPORT
// ==============================

export const getActivitiesVsOutcomesReport = async () => {
  try {
    const response = await api.get(`${RESOURCE}/activities-vs-outcomes`);
    return response.data;
  } catch (error) {
    console.error("Error fetching activities vs outcomes report:", error);
    throw error;
  }
};

// ==============================
// BATCH OPERATIONS
// ==============================

export const getBatchReports = async (reportConfigs) => {
  if (!Array.isArray(reportConfigs) || reportConfigs.length === 0) {
    throw new Error("Report configurations array is required");
  }

  try {
    const promises = reportConfigs.map(async (config) => {
      const { type, filters = {} } = config;
      
      switch (type) {
        case 'salesPipeline':
          return { type, data: await getSalesPipelineReport(filters) };
        case 'revenueForecast':
          return { type, data: await getRevenueForecastReport(filters) };
        case 'closedDealsByPeriod':
          return { type, data: await getClosedDealsByPeriodReport(filters) };
        case 'closedDealsByAccount':
          return { type, data: await getClosedDealsByAccountReport(filters) };
        case 'closedDealsByRole':
          return { type, data: await getClosedDealsByRoleReport(filters) };
        case 'closedDealsByTeam':
          return { type, data: await getClosedDealsByTeamReport(filters) };
        case 'closedDealsByProduct':
          return { type, data: await getClosedDealsByProductReport(filters) };
        case 'customerSegmentation':
          return { type, data: await getCustomerSegmentationReport(filters) };
        case 'activitiesVsOutcomes':
          return { type, data: await getActivitiesVsOutcomesReport() };
        default:
          throw new Error(`Unknown report type: ${type}`);
      }
    });
    
    const results = await Promise.allSettled(promises);
    
    const success = [];
    const errors = [];
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        success.push(result.value);
      } else {
        errors.push({
          config: reportConfigs[index],
          error: result.reason.message
        });
      }
    });
    
    return { success, errors };
  } catch (error) {
    console.error("Error in batch report operation:", error);
    throw error;
  }
};

// ==============================
// UTILITY FUNCTIONS
// ==============================

// const buildQueryParams = (filters) => {
//   const validParams = Object.entries(filters)
//     .filter(([key, value]) => value !== null && value !== undefined && value !== '')
//     .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  
//   return validParams.length > 0 ? `?${validParams.join('&')}` : '';
// };

export const validateDateRange = (startDate, endDate) => {
  const errors = [];
  
  if (!isValidDateFormat(startDate)) {
    errors.push('Start date must be in YYYY-MM-DD format');
  }
  
  if (!isValidDateFormat(endDate)) {
    errors.push('End date must be in YYYY-MM-DD format');
  }
  
  if (errors.length === 0) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      errors.push('Start date must be before or equal to end date');
    }
    
    if (end > new Date()) {
      errors.push('End date cannot be in the future');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const getDateRanges = () => {
  const today = new Date();
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
  const currentQuarter = getQuarterStart(today);
  const lastQuarter = getQuarterStart(new Date(today.getFullYear(), today.getMonth() - 3, 1));
  const lastQuarterEnd = new Date(currentQuarter.getTime() - 1);
  const currentYear = new Date(today.getFullYear(), 0, 1);
  const lastYear = new Date(today.getFullYear() - 1, 0, 1);
  const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);

  return {
    today: {
      startDate: formatDate(today),
      endDate: formatDate(today),
      label: 'Today'
    },
    thisWeek: {
      startDate: formatDate(getWeekStart(today)),
      endDate: formatDate(today),
      label: 'This Week'
    },
    thisMonth: {
      startDate: formatDate(currentMonth),
      endDate: formatDate(today),
      label: 'This Month'
    },
    lastMonth: {
      startDate: formatDate(lastMonth),
      endDate: formatDate(lastMonthEnd),
      label: 'Last Month'
    },
    thisQuarter: {
      startDate: formatDate(currentQuarter),
      endDate: formatDate(today),
      label: 'This Quarter'
    },
    lastQuarter: {
      startDate: formatDate(lastQuarter),
      endDate: formatDate(lastQuarterEnd),
      label: 'Last Quarter'
    },
    thisYear: {
      startDate: formatDate(currentYear),
      endDate: formatDate(today),
      label: 'This Year'
    },
    lastYear: {
      startDate: formatDate(lastYear),
      endDate: formatDate(lastYearEnd),
      label: 'Last Year'
    },
    last30Days: {
      startDate: formatDate(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)),
      endDate: formatDate(today),
      label: 'Last 30 Days'
    },
    last90Days: {
      startDate: formatDate(new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)),
      endDate: formatDate(today),
      label: 'Last 90 Days'
    }
  };
};

// ==============================
// HELPER FUNCTIONS
// ==============================

const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

const getWeekStart = (date) => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

const getQuarterStart = (date) => {
  const quarter = Math.floor(date.getMonth() / 3);
  return new Date(date.getFullYear(), quarter * 3, 1);
};

const isValidDateFormat = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date) && dateString === date.toISOString().split('T')[0];
};

// ==============================
// EXPORT ALL FUNCTIONS
// ==============================

export default {
  getSalesPipelineReport,
  getRevenueForecastReport,
  getClosedDealsByPeriodReport,
  getClosedDealsByAccountReport,
  getClosedDealsByRoleReport,
  getClosedDealsByTeamReport,
  getClosedDealsByProductReport,
  getCustomerSegmentationReport,
  getActivitiesVsOutcomesReport,
  getBatchReports,
  validateDateRange,
  getDateRanges
};

/*
Usage Examples:

// Import individual functions
import { getSalesPipelineReport, getRevenueForecastReport } from './reportService';

// Or import all as object
import reportService from './reportService';

// Basic usage
const pipelineData = await getSalesPipelineReport({
  startDate: '2025-01-01',
  endDate: '2025-01-31'
});

// With predefined date ranges
const ranges = getDateRanges();
const revenueData = await getRevenueForecastReport(ranges.thisMonth);

// Batch reports
const batchResults = await getBatchReports([
  { type: 'salesPipeline', filters: { startDate: '2025-01-01', endDate: '2025-01-31' } },
  { type: 'customerSegmentation', filters: { segmentType: 'Industry' } }
]);

// Date validation
const validation = validateDateRange('2025-01-01', '2025-01-31');
if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
}
*/