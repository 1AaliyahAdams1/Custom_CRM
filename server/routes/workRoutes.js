const express = require("express");
const router = express.Router();
const workController = require("../controllers/workController");

//======================================
// SMART WORK PAGE - MAIN ROUTES
//======================================

// Main entry point for Smart Work Page activities
router.get("/user/:userId/activities", workController.getActivities);

// Work dashboard summary
router.get("/user/:userId/dashboard", workController.getWorkDashboard);

//======================================
// WORKSPACE TAB MANAGEMENT
//======================================

// Get specific activity for workspace tab
router.get("/user/:userId/activity/:activityId/workspace", workController.getActivityForWorkspace);

// Complete activity with smart workflow
router.post("/activities/:id/complete", workController.completeActivity);

// Mark activity complete (simple)
router.patch("/user/:userId/activity/:activityId/complete", workController.markComplete);

// Update activity in workspace
router.put("/user/:userId/activity/:activityId", workController.updateActivity);

// Delete activity from workspace
router.delete("/user/:userId/activity/:activityId", workController.deleteActivity);

//======================================
// WORKFLOW AND NAVIGATION
//======================================

// Get next activity for workflow
router.get("/user/:userId/next-activity", workController.getNextActivity);

// Get activities by status filter
router.get("/user/:userId/activities/:status", workController.getActivitiesByStatus);

// Get day view activities (calendar)
router.get("/user/:userId/day-view", workController.getDayView);

//======================================
// SEQUENCES INTEGRATION
//======================================

// Get sequences and items by user (for sequence management)
router.get("/user/:userId/sequences-items", workController.getSequencesAndItemsByUser);

// Get user sequences (for context and assignment)
router.get("/user/:userId/sequences", workController.getUserSequences);

// Get activities by user (legacy/alternative endpoint)
router.get("/user/:userId/activities-simple", workController.getActivitiesByUser);

//======================================
// METADATA AND CONFIGURATION
//======================================

// Get activity metadata (for forms and editing)
router.get("/metadata/activity", workController.getActivityMetadata);

module.exports = router;