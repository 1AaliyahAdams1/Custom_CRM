const express = require("express");
const router = express.Router();
const activityController = require("../controllers/activityController");

router.get("/", activityController.getAllActivities);
router.get("/:id", activityController.getActivityByID);
router.post("/", activityController.createActivity);
router.put("/:id", activityController.updateActivity);
router.patch("/:id/deactivate", activityController.deactivateActivity);
router.patch("/:id/reactivate", activityController.reactivateActivity);
router.delete("/:id/delete", activityController.deleteActivity);

module.exports = router;
