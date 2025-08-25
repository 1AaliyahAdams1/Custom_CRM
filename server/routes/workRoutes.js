const express = require("express");
const router = express.Router();
const workController = require("../controllers/workController");

// Get work page activities (with sorting options)
router.get("/user/:userId/activities", workController.getActivities);

// Get activities by status filter
router.get("/user/:userId/activities/:status", workController.getActivitiesByStatus);

// Get day view activities (calendar style)
router.get("/user/:userId/day-view", workController.getDayView);

// Complete an activity
router.post("/activities/:id/complete", workController.completeActivity);

// Update activity order (drag & drop)
router.put("/activities/reorder", workController.reorderActivities);

module.exports = router;