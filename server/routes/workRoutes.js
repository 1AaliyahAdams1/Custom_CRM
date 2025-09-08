const express = require("express");
const router = express.Router();
const workController = require("../controllers/workController");

// =======================
// SMART WORK PAGE ROUTES
// =======================

// Get work dashboard summary (overview stats and recent activity)
router.get("/user/:userId/dashboard", workController.getWorkDashboard);

// Get smart work page activities (with sorting and filtering)
// Query params: ?sort=dueDate|priority|account|type|sequence|status&filter=all|overdue|urgent|high-priority|completed|pending|today
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
// SMART WORKFLOW ROUTES
// =======================

// Get next activity in smart workflow (supports intelligent progression)
// Query params: ?currentActivityId=123 (to exclude current activity)
router.get("/user/:userId/next-activity", workController.getNextActivity);

// =======================
// CALENDAR/DAY VIEW ROUTES
// =======================

// Get day view activities (calendar style grouping by hour)
// Query params: ?date=2024-01-15 (defaults to today)
router.get("/user/:userId/day-view", workController.getDayView);

// =======================
// WORKSPACE ACTIVITY MANAGEMENT
// =======================

// Complete an activity (includes smart workflow: auto-get next activity)
// Body: { userId: number, notes?: string }
router.post("/activities/:id/complete", workController.completeActivity);

// Mark activity as complete (simple completion without workflow)
router.patch("/user/:userId/activity/:activityId/complete", workController.markComplete);

// Update activity in workspace (for editing due dates, priority, etc.)
// Body: { dueToStart?: Date, dueToEnd?: Date, priorityLevelId?: number }
router.put("/user/:userId/activity/:activityId", workController.updateActivity);

// Soft delete activity (sets Active = 0, suggests next activity)
router.delete("/user/:userId/activity/:activityId", workController.deleteActivity);

module.exports = router;