// chatbotRoutes.js
const express = require("express");
const router = express.Router();
const { 
  chatWithBot, 
  fetchHistory, 
  healthCheck, 
  getDashboard,
  getUserSummary 
} = require("../controllers/chatbotController");

// ============================================
// CHATBOT API ROUTES
// Base path: /api/chatbot
// ============================================

// Health check - must be before other routes to avoid conflicts
router.get("/health", healthCheck);

// User summary - quick profile fetch
router.get("/summary/:userId", getUserSummary);

// Conversation history
router.get("/history/:userId", fetchHistory);

// Full dashboard with analytics
router.get("/dashboard/:userId", getDashboard);

// Main chat endpoint - handle messages
router.post("/", chatWithBot);

module.exports = router;