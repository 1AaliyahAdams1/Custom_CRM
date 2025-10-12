// chatbotController.js
const { processChatEnhanced, getHistoryEnhanced, getDashboardSummary } = require("../services/chatbotService");

/**
 * Handles incoming chatbot messages with enhanced context and intelligence
 */
async function chatWithBot(req, res) {
  const { message, userId = "guest" } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Invalid message format." });
  }

  // Convert userId to integer if it's a string number
  const userIdInt = typeof userId === "string" && !isNaN(userId) ? parseInt(userId) : userId;

  try {
    const { aiResponse, dbResults, requestType, context } = await processChatEnhanced(userIdInt, message);

    res.json({
      response: aiResponse,
      requestType,
      context,
      foundIn: Object.keys(dbResults).filter((k) => !['error', 'userProfile'].includes(k)),
      metadata: {
        hasUserProfile: !!dbResults.userProfile,
        tasksRetrieved: context.tasksFound,
        dealsRetrieved: context.dealsFound,
        accountsRetrieved: context.accountsFound,
        contactsRetrieved: context.contactsFound,
        insightsProvided: context.hasInsights,
        emailContextFound: context.hasEmailContext
      }
    });
  } catch (err) {
    console.error("ChatbotController error:", err);
    res.status(500).json({ 
      error: err.message,
      details: "An error occurred while processing your request. Please try again."
    });
  }
}

/**
 * Fetches chat history for a given userId
 */
async function fetchHistory(req, res) {
  const { userId } = req.params;
  const limit = parseInt(req.query.limit) || 20;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId parameter" });
  }

  // Convert userId to integer
  const userIdInt = parseInt(userId);
  
  if (isNaN(userIdInt)) {
    return res.status(400).json({ error: "Invalid userId format" });
  }

  try {
    const history = await getHistoryEnhanced(userIdInt, limit);
    res.json({ 
      history,
      count: history.length,
      limit
    });
  } catch (err) {
    console.error("Fetch history error:", err);
    res.status(500).json({ error: "Could not fetch chat history." });
  }
}

/**
 * Gets comprehensive dashboard data for a user
 */
async function getDashboard(req, res) {
  const { userId } = req.params;
  
  if (!userId) {
    return res.status(400).json({ error: "Missing userId parameter" });
  }

  // Convert userId to integer
  const userIdInt = parseInt(userId);
  
  if (isNaN(userIdInt)) {
    return res.status(400).json({ error: "Invalid userId format" });
  }

  try {
    const summary = await getDashboardSummary(userIdInt);
    
    if (!summary) {
      return res.status(404).json({ error: "Could not generate dashboard for this user" });
    }

    res.json(summary);
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ 
      error: "Could not generate dashboard.",
      details: err.message 
    });
  }
}

/**
 * Simple health check endpoint for chatbot service
 */
function healthCheck(req, res) {
  res.json({
    status: "ok",
    service: "Enhanced CRM Chatbot",
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    model: "gemini-2.0-flash-exp",
    features: [
      "Task Management",
      "Email Drafting",
      "Business Insights",
      "Pipeline Analytics",
      "Context-Aware Responses",
      "Conversation History"
    ],
    database: "8589_CRM",
    version: "2.0.0",
    timestamp: new Date().toISOString()
  });
}

/**
 * Quick user summary endpoint - lighter than full dashboard
 */
async function getUserSummary(req, res) {
  const { userId } = req.params;
  
  if (!userId) {
    return res.status(400).json({ error: "Missing userId parameter" });
  }

  const userIdInt = parseInt(userId);
  
  if (isNaN(userIdInt)) {
    return res.status(400).json({ error: "Invalid userId format" });
  }

  try {
    const { getUserProfile } = require("../data/chatbotRepository");
    const profile = await getUserProfile(userIdInt);
    
    res.json({
      user: profile,
      message: `Welcome back, ${profile.name || 'User'}!`
    });
  } catch (err) {
    console.error("User summary error:", err);
    res.status(500).json({ error: "Could not fetch user summary." });
  }
}

module.exports = { 
  chatWithBot, 
  fetchHistory, 
  getDashboard,
  getUserSummary,
  healthCheck 
};