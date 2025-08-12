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
router.get("/user/:userId", activityController.getActivitiesByUser); 

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

// module.exports = router;
