const express = require("express");
const router = express.Router();
const activityTypeController = require("../controllers/activityTypeController");

router.get("/", activityTypeController.getAllActivityTypes);
router.get("/:id", activityTypeController.getActivityTypeById);
router.post("/", activityTypeController.createActivityType);
router.put("/:id", activityTypeController.updateActivityType);
router.delete("/:id", activityTypeController.deleteActivityType);

module.exports = router;
