const express = require("express");
const router = express.Router();
const workController = require("../controllers/workController");

router.get("/user/:userId/dashboard", workController.getWorkDashboard);

router.get("/user/:userId/activities", workController.getActivities);

router.get("/user/:userId/activity/:activityId/workspace", workController.getActivityForWorkspace);

router.get("/user/:userId/activity/:activityId/workspace", workController.getActivityForWorkspace);

router.get("/user/:userId/activities/:status", workController.getActivitiesByStatus);

router.get("/user/:userId/sequences", workController.getUserSequences);

router.get("/metadata/activity", workController.getActivityMetadata);

router.get("/user/:userId/next-activity", workController.getNextActivity);

router.get("/user/:userId/day-view", workController.getDayView);

router.post("/activities/:id/complete", workController.completeActivity);

router.patch("/user/:userId/activity/:activityId/complete", workController.markComplete);

router.put("/user/:userId/activity/:activityId", workController.updateActivity);

router.delete("/user/:userId/activity/:activityId", workController.deleteActivity);

module.exports = router;