const express = require("express");
const router = express.Router();
const activityTypeController = require("../controllers/activityTypeController");

router.get("/", activityTypeController.getAllActivityTypes);
router.get("/:id", activityTypeController.getActivityTypeById);
router.post("/", activityTypeController.createActivityType);
router.put("/:id", activityTypeController.updateActivityType);
router.patch("/:id/deactivate", activityTypeController.deactivateActivityType);
router.patch("/:id/reactivate", activityTypeController.reactivateActivityType);
router.delete("/:id/delete", activityTypeController.deleteActivityType);

module.exports = router;
