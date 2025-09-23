const express = require("express");
const router = express.Router();
const activityController = require("../controllers/activityController");
router.get("/", activityController.getAllActivities);
router.get("/user/:userId", activityController.getActivitiesByUser); 
router.get("/:id", activityController.getActivityByID);
router.post("/", activityController.createActivity);
router.put("/:id", activityController.updateActivity);
router.patch("/:id/deactivate", activityController.deactivateActivity);
router.patch("/:id/reactivate", activityController.reactivateActivity);
router.delete("/:id/delete", activityController.deleteActivity);


// Bulk Operations Routes
router.patch("/bulk/complete", activityController.bulkMarkActivitiesComplete);
router.patch("/bulk/incomplete", activityController.bulkMarkActivitiesIncomplete);
router.patch("/bulk/status", activityController.bulkUpdateActivityStatus);
router.patch("/bulk/priority", activityController.bulkUpdateActivityPriority);
router.patch("/bulk/due-dates", activityController.bulkUpdateActivityDueDates);

module.exports = router;





//ROLE BASED ACCESS BACKEND
// const express = require("express");
// const router = express.Router();
// const activityController = require("../controllers/activityController");
// const { authenticateJWT } = require("../middleware/authMiddleware");
// const { authorizeRoleDynamic } = require("../middleware/authorizeRoleMiddleware");

// // Get all activities - only C-level and Sales Manager
// router.get(
//   "/",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level", "Sales Manager"], "activity"),
//   activityController.getAllActivities
// );

// // Get specific activity by ID - C-level, Sales Manager, Sales Rep
// router.get(
//   "/:id",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level", "Sales Manager", "Sales Representative"], "activity"),
//   activityController.getActivityByID
// );

// // Create new activity - only C-level
// router.post(
//   "/",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level"], "activity"),
//   activityController.createActivity
// );

// // Update activity - only C-level
// router.put(
//   "/:id",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level"], "activity"),
//   activityController.updateActivity
// );

// // Deactivate activity (soft delete) - only C-level
// router.patch(
//   "/:id/deactivate",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level"], "activity"),
//   activityController.deactivateActivity
// );

// // Reactivate activity - only C-level
// router.patch(
//   "/:id/reactivate",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level"], "activity"),
//   activityController.reactivateActivity
// );

// // Permanently delete activity - only C-level
// router.delete(
//   "/:id/delete",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level"], "activity"),
//   activityController.deleteActivity
// );

// // Bulk Operations 
// router.patch(
//   "/bulk/complete",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level", "Sales Manager"], "activity"),
//   activityController.bulkMarkActivitiesComplete
// );

// router.patch(
//   "/bulk/incomplete",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level", "Sales Manager"], "activity"),
//   activityController.bulkMarkActivitiesIncomplete
// );

// router.patch(
//   "/bulk/status",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level", "Sales Manager"], "activity"),
//   activityController.bulkUpdateActivityStatus
// );

// router.patch(
//   "/bulk/priority",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level", "Sales Manager"], "activity"),
//   activityController.bulkUpdateActivityPriority
// );

// router.patch(
//   "/bulk/due-dates",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level", "Sales Manager"], "activity"),
//   activityController.bulkUpdateActivityDueDates
// );

// module.exports = router;
