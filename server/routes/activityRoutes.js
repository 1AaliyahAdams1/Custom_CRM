const express = require("express");
const router = express.Router();
const activityController = require("../controllers/activityController");
const { authorize } = require("../middleware/accessControl"); 

router.get("/", authorize("ViewActivities"), activityController.getAllActivities);
router.get("/:id", authorize("ViewActivities"), activityController.getActivityByID);
router.post("/", authorize("CreateActivities"), activityController.createActivity);
router.put("/:id", authorize("EditActivities"), activityController.updateActivity);
router.patch("/:id/deactivate", authorize("EditActivities"), activityController.deactivateActivity);
router.patch("/:id/reactivate", authorize("EditActivities"), activityController.reactivateActivity);
router.delete("/:id/delete", authorize("DeleteActivities"), activityController.deleteActivity);

module.exports = router;
