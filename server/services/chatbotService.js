const { 
  searchDatabaseEnhanced, 
  getChatHistoryEnhanced, 
  saveChatHistoryEnhanced 
} = require("../data/chatbotRepository");
const { 
  generateEnhancedCRMResponse, 
  detectRequestType 
} = require("../utils/crmAssistantUtil");

/**
 * Process chat with enhanced context and intelligence
 * Requires valid userId - no guest access
 */
async function processChatEnhanced(userId, message) {
  if (!message || typeof message !== "string") {
    throw new Error("Invalid message input.");
  }

  // Validate userId - must be a valid number
  const userIdInt = typeof userId === "string" ? parseInt(userId, 10) : userId;
  if (!userIdInt || isNaN(userIdInt)) {
    throw new Error("Authentication required. Please log in to use the chatbot.");
  }

  // Detect what type of request this is
  const requestType = detectRequestType(message);

  // Get conversation history for context
  let conversationHistory = [];
  try {
    conversationHistory = await getChatHistoryEnhanced(userIdInt, 5);
  } catch (err) {
    console.warn("⚠️ Could not fetch conversation history:", err.message);
  }

  // Search database with enhanced intelligence
  let dbResults = {};
  try {
    dbResults = await searchDatabaseEnhanced(message, userIdInt);
  } catch (dbErr) {
    console.warn("⚠️ Database query failed:", dbErr.message);
    dbResults = { error: dbErr.message };
  }

  // Build comprehensive context
  const context = {
    dbResults,
    userId: userIdInt,
    userProfile: dbResults.userProfile || {},
    conversationHistory,
    requestType
  };

  // Generate enhanced AI response
  let aiResponse = "No response generated.";
  try {
    aiResponse = await generateEnhancedCRMResponse(message, context);
  } catch (aiErr) {
    console.error("⚠️ AI response generation failed:", aiErr.message);
    aiResponse = "I apologize, but I'm having trouble processing your request right now. Please try again.";
  }

  // Save chat history with metadata
  try {
    await saveChatHistoryEnhanced(userIdInt, message, aiResponse, requestType);
  } catch (saveErr) {
    console.warn("⚠️ Failed to save chat history:", saveErr.message);
  }

  return { 
    aiResponse, 
    dbResults,
    requestType,
    context: {
      tasksFound: dbResults.myTasks?.length || 0,
      dealsFound: dbResults.deals?.length || 0,
      accountsFound: dbResults.accounts?.length || 0,
      contactsFound: dbResults.contacts?.length || 0,
      hasInsights: !!dbResults.insights,
      hasEmailContext: !!dbResults.emailContext
    }
  };
}

/**
 * Get enriched chat history
 */
async function getHistoryEnhanced(userId, limit = 20) {
  try {
    const userIdInt = typeof userId === "string" ? parseInt(userId, 10) : userId;
    if (isNaN(userIdInt)) {
      throw new Error("Invalid userId format");
    }

    const history = await getChatHistoryEnhanced(userIdInt, limit);
    return history;
  } catch (err) {
    console.error("⚠️ Failed to fetch chat history:", err.message);
    return [];
  }
}

/**
 * Get user's dashboard summary for proactive insights
 */
async function getDashboardSummary(userId) {
  try {
    const userIdInt = typeof userId === "string" ? parseInt(userId, 10) : userId;
    if (isNaN(userIdInt)) {
      throw new Error("Invalid userId format");
    }

    const dbResults = await searchDatabaseEnhanced("dashboard summary", userIdInt);
    
    const overdueTasks = dbResults.myTasks?.filter(t => t.isOverdue) || [];
    const upcomingTasks = dbResults.myTasks?.filter(t => t.isPending && !t.isOverdue) || [];
    const completedTasks = dbResults.myTasks?.filter(t => t.Status === 1 || t.Completed === true) || [];

    const summary = {
      user: dbResults.userProfile,
      tasks: {
        total: dbResults.myTasks?.length || 0,
        overdue: overdueTasks.length,
        upcoming: upcomingTasks.length,
        completed: completedTasks.length,
        details: dbResults.myTasks || []
      },
      deals: {
        summary: dbResults.myDealsSummary || {},
        total: dbResults.myDealsSummary?.TotalDeals || 0,
        value: dbResults.myDealsSummary?.TotalValue || 0,
        winRate: dbResults.myDealsSummary?.WinRate || 0
      },
      insights: dbResults.insights || {},
      timestamp: new Date().toISOString()
    };

    return summary;
  } catch (err) {
    console.error("⚠️ Failed to generate dashboard:", err.message);
    return null;
  }
}

module.exports = { 
  processChatEnhanced, 
  getHistoryEnhanced,
  getDashboardSummary
};