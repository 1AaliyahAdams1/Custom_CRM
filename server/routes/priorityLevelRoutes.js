const express = require("express");
const router = express.Router();
const priorityLevelController = require("../controllers/priorityLevelController");

router.get("/", priorityLevelController.getAllPriorityLevels);
router.get("/:id", priorityLevelController.getPriorityLevelById);
router.post("/", priorityLevelController.createPriorityLevel);
router.put("/:id", priorityLevelController.updatePriorityLevel);
router.delete("/:id", priorityLevelController.deletePriorityLevel);

module.exports = router;
