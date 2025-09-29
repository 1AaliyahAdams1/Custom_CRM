const express = require("express");
const router = express.Router();
const workController = require("../controllers/workController");

//======================================
// WORK/ACTIVITY ROUTES
//======================================
router.get("/user/:userId/activities", workController.getActivities);
router.get("/user/:userId/activities-simple", workController.getActivitiesByUser);
router.get("/user/:userId/activity/:activityId/workspace", workController.getActivityForWorkspace);
router.put("/user/:userId/activity/:activityId", workController.updateActivity);
router.patch("/user/:userId/activity/:activityId/complete", workController.markComplete);
router.delete("/user/:userId/activity/:activityId", workController.deleteActivity);
router.post("/activities/:id/complete", workController.completeActivity);
router.get("/user/:userId/next-activity", workController.getNextActivity);
router.get("/user/:userId/dashboard", workController.getWorkDashboard);
router.get("/user/:userId/activities/:status", workController.getActivitiesByStatus);
router.get("/user/:userId/day-view", workController.getDayView);
router.get("/metadata/activity", workController.getActivityMetadata);

module.exports = router;