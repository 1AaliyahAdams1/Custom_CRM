import api from "../utils/api";

// ==============================
// SALES PIPELINE REPORT
// ==============================
export const getSalesPipelineReport = async (startDate, endDate) => {
  try {
    const response = await api.get("/reports/sales-pipeline", {
      params: { 
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching sales pipeline report:", error);
    throw new Error("Failed to fetch sales pipeline report");
  }
};

// ==============================
// REVENUE FORECAST REPORT
// ==============================
export const getRevenueForecastReport = async (startDate, endDate, stageName = 'Closed Won') => {
  try {
    const response = await api.get("/reports/revenue-forecast", {
      params: { 
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        stageName
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching revenue forecast report:", error);
    throw new Error("Failed to fetch revenue forecast report");
  }
};

// ==============================
// CLOSED DEALS REPORT
// ==============================
export const getClosedDealsByPeriodReport = async (stageName = 'Closed Won', startDate, endDate) => {
  try {
    const response = await api.get("/reports/closed-deals/period", {
      params: { 
        stageName,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching closed deals by period report:", error);
    throw new Error("Failed to fetch closed deals by period report");
  }
};

export const getClosedDealsByAccountReport = async (stageName = 'Closed Won', startDate, endDate) => {
  try {
    const response = await api.get("/reports/closed-deals/account", {
      params: { 
        stageName,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching closed deals by account report:", error);
    throw new Error("Failed to fetch closed deals by account report");
  }
};

export const getClosedDealsByRoleReport = async (stageName = 'Closed Won', roleName = 'Sales Representative', startDate, endDate) => {
  try {
    const response = await api.get("/reports/closed-deals/role", {
      params: { 
        stageName,
        roleName,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching closed deals by role report:", error);
    throw new Error("Failed to fetch closed deals by role report");
  }
};

export const getClosedDealsByTeamReport = async (stageName = 'Closed Won', startDate, endDate) => {
  try {
    const response = await api.get("/reports/closed-deals/team", {
      params: { 
        stageName,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching closed deals by team report:", error);
    throw new Error("Failed to fetch closed deals by team report");
  }
};

export const getClosedDealsByProductReport = async (stageName = 'Closed Won', startDate, endDate) => {
  try {
    const response = await api.get("/reports/closed-deals/product", {
      params: { 
        stageName,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching closed deals by product report:", error);
    throw new Error("Failed to fetch closed deals by product report");
  }
};

// ==============================
// CUSTOMER SEGMENTATION REPORT
// ==============================
export const getCustomerSegmentationReport = async (segmentType = 'Industry') => {
  try {
    const response = await api.get("/reports/customer-segmentation", {
      params: { segmentType },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching customer segmentation report:", error);
    throw new Error("Failed to fetch customer segmentation report");
  }
};

// ==============================
// ACTIVITIES VS OUTCOMES REPORT
// ==============================
export const getActivitiesVsOutcomesReport = async () => {
  try {
    const response = await api.get("/reports/activities-outcomes");
    return response.data;
  } catch (error) {
    console.error("Error fetching activities vs outcomes report:", error);
    throw new Error("Failed to fetch activities vs outcomes report");
  }
};

// ==================
// DASHBOARD SUMMARY 
// ==================
export const getDashboardSummary = async (startDate, endDate) => {
  try {
    const response = await api.get("/reports/dashboard-summary", {
      params: {
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    throw new Error("Failed to fetch dashboard summary");
  }
};

const reportService = {
  getSalesPipelineReport,
  getRevenueForecastReport,
  getClosedDealsByPeriodReport,
  getCustomerSegmentationReport,
  getActivitiesVsOutcomesReport,
  getDashboardSummary
};

export default reportService;