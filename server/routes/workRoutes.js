const express = require("express");
const router = express.Router();
const workController = require("../controllers/workController");

//======================================
// WORK PAGE ROUTES
//======================================
router.get("/user/:userId/activities", workController.getWorkPageActivities);
router.get("/user/:userId/account/:accountId/grouped", workController.getAccountActivitiesGrouped);
router.get("/user/:userId/activity/:activityId", workController.getActivityByID);
router.put("/user/:userId/activity/:activityId", workController.updateActivity);
router.put("/user/:userId/activity/:activityId/due-date", workController.updateActivityDueDateWithCascade);
router.post("/activities/:id/complete", workController.completeActivity);
router.patch("/user/:userId/activity/:activityId/complete", workController.markComplete);
router.delete("/user/:userId/activity/:activityId", workController.deleteActivity);
router.get("/user/:userId/next-activity", workController.getNextActivity);
router.get("/user/:userId/dashboard", workController.getWorkDashboard);
router.get("/metadata/activity", workController.getActivityMetadata);

module.exports = router;