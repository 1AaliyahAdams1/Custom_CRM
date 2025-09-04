const express = require("express");
const router = express.Router();
const workController = require("../controllers/workController");

// =======================
// SMART WORK PAGE ROUTES
// =======================

// Get work dashboard summary (overview stats and recent activity)
router.get("/user/:userId/dashboard", workController.getWorkDashboard);

// Get work page activities (with sorting and filtering options)
router.get("/user/:userId/activities", workController.getActivities);

// Get single activity for workspace tab with full context
router.get("/user/:userId/activity/:activityId/workspace", workController.getActivityForWorkspace);

// Get activities by status filter (overdue, urgent, normal, completed, etc.)
router.get("/user/:userId/activities/:status", workController.getActivitiesByStatus);

// Get user sequences for workspace context
router.get("/user/:userId/sequences", workController.getUserSequences);

// Get activity metadata (priority levels, activity types for editing forms)
router.get("/metadata/activity", workController.getActivityMetadata);

// =======================
// WORKFLOW SUPPORT ROUTES
// =======================

// Get next activity in workflow (supports smart progression)
router.get("/user/:userId/next-activity", workController.getNextActivity);

// =======================
// CALENDAR/DAY VIEW ROUTES
// =======================

// Get day view activities (calendar style)
router.get("/user/:userId/day-view", workController.getDayView);

// =======================
// ACTIVITY MANAGEMENT ROUTES
// =======================

// Complete an activity (includes getting next activity for workflow)
router.post("/activities/:id/complete", workController.completeActivity);

// Update activity (for workspace editing) - RESTful approach
router.put("/user/:userId/activity/:activityId", workController.updateActivity);

// Soft delete activity
router.delete("/user/:userId/activity/:activityId", workController.deleteActivity);

module.exports = router;