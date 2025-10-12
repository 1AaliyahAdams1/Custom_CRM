// chatService.js
import api from '../utils/api';

/**
 * Send a message to the AI chatbot
 * @param {string} message - The user's message
 * @param {number|string} userId - The user's ID (defaults to "guest")
 * @returns {Promise<Object>} Full response object with metadata
 */
export const sendMessageToAI = async (message, userId = "guest") => {
  try {
    const response = await api.post("/chatbot", { message, userId });
    return response.data; // Returns { response, requestType, context, foundIn, metadata }
  } catch (err) {
    console.error("[ChatService] Error sending message:", err);
    throw new Error(err.response?.data?.error || "AI server is not responding.");
  }
};

/**
 * Get the AI response text only (simplified version)
 * @param {string} message - The user's message
 * @param {number|string} userId - The user's ID
 * @returns {Promise<string>} Just the AI response text
 */
export const getAIResponse = async (message, userId = "guest") => {
  try {
    const data = await sendMessageToAI(message, userId);
    return data.response;
  } catch (err) {
    return "AI server is not responding.";
  }
};

/**
 * Get conversation history for a user
 * @param {number|string} userId - The user's ID
 * @param {number} limit - Number of messages to retrieve (default 20)
 * @returns {Promise<Array>} Array of conversation history
 */
export const getChatHistory = async (userId, limit = 20) => {
  try {
    const response = await api.get(`/chatbot/history/${userId}?limit=${limit}`);
    return response.data.history || [];
  } catch (err) {
    console.error("[ChatService] Error fetching history:", err);
    return [];
  }
};

/**
 * Get user dashboard with tasks, deals, and insights
 * @param {number|string} userId - The user's ID
 * @returns {Promise<Object>} Dashboard data
 */
export const getUserDashboard = async (userId) => {
  try {
    const response = await api.get(`/chatbot/dashboard/${userId}`);
    return response.data;
  } catch (err) {
    console.error("[ChatService] Error fetching dashboard:", err);
    throw new Error(err.response?.data?.error || "Could not fetch dashboard.");
  }
};

/**
 * Get quick user summary
 * @param {number|string} userId - The user's ID
 * @returns {Promise<Object>} User profile summary
 */
export const getUserSummary = async (userId) => {
  try {
    const response = await api.get(`/chatbot/summary/${userId}`);
    return response.data;
  } catch (err) {
    console.error("[ChatService] Error fetching user summary:", err);
    throw new Error(err.response?.data?.error || "Could not fetch user summary.");
  }
};

/**
 * Check chatbot service health
 * @returns {Promise<Object>} Health status
 */
export const checkHealth = async () => {
  try {
    const response = await api.get("/chatbot/health");
    return response.data;
  } catch (err) {
    console.error("[ChatService] Health check failed:", err);
    return { status: "error", message: "Service unavailable" };
  }
};

/**
 * Parse AI response for special content types
 * @param {Object} responseData - Full response from sendMessageToAI
 * @returns {Object} Parsed response with flags
 */
export const parseAIResponse = (responseData) => {
  return {
    text: responseData.response,
    type: responseData.requestType,
    isEmailDraft: responseData.requestType === 'email_draft',
    isTaskQuery: responseData.requestType === 'task_query',
    isInsights: responseData.requestType === 'insights',
    hasContext: responseData.context?.tasksFound > 0 || 
                responseData.context?.dealsFound > 0 ||
                responseData.context?.accountsFound > 0,
    contextCounts: {
      tasks: responseData.context?.tasksFound || 0,
      deals: responseData.context?.dealsFound || 0,
      accounts: responseData.context?.accountsFound || 0,
      contacts: responseData.context?.contactsFound || 0
    },
    metadata: responseData.metadata
  };
};

/**
 * Format dashboard data for display
 * @param {Object} dashboardData - Raw dashboard data
 * @returns {Object} Formatted dashboard
 */
export const formatDashboard = (dashboardData) => {
  if (!dashboardData) return null;

  return {
    user: {
      name: dashboardData.user?.name || 'User',
      email: dashboardData.user?.email,
      role: dashboardData.user?.role,
      department: dashboardData.user?.department
    },
    tasks: {
      total: dashboardData.tasks?.total || 0,
      overdue: dashboardData.tasks?.overdue || 0,
      upcoming: dashboardData.tasks?.upcoming || 0,
      completed: dashboardData.tasks?.completed || 0,
      list: dashboardData.tasks?.details || []
    },
    deals: {
      total: dashboardData.deals?.total || 0,
      value: dashboardData.deals?.value || 0,
      winRate: dashboardData.deals?.winRate || 0,
      summary: dashboardData.deals?.summary || {}
    },
    insights: dashboardData.insights || {},
    timestamp: dashboardData.timestamp
  };
};

/**
 * Helper: Format currency
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

/**
 * Helper: Format date
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'No date';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

/**
 * Helper: Check if task is overdue
 */
export const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

// Default export with all functions
export default {
  sendMessageToAI,
  getAIResponse,
  getChatHistory,
  getUserDashboard,
  getUserSummary,
  checkHealth,
  parseAIResponse,
  formatDashboard,
  formatCurrency,
  formatDate,
  isOverdue
};