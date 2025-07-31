const express = require("express");
const router = express.Router();
const dealStageController = require("../controllers/dealStageController");

router.get("/", dealStageController.getAllDealStages);
router.get("/:id", dealStageController.getDealStageById);
router.post("/", dealStageController.createDealStage);
router.put("/:id", dealStageController.updateDealStage);
router.patch("/:id/deactivate", dealStageController.deactivateDealStage);
router.patch("/:id/reactivate", dealStageController.reactivateDealStage);
router.delete("/:id/delete", dealStageController.deleteDealStage);

module.exports = router;
