const express = require("express");
const router = express.Router();
const dealController = require("../controllers/dealController");
const { authorize } = require("../middleware/accessControl"); 

router.get("/", authorize("ViewDeal"), dealController.getAllDeals);
router.get("/:id", authorize("ViewDeal"), dealController.getDealById);
router.post("/", authorize("CreateDeal"), dealController.createDeal);
router.put("/:id", authorize("UpdateDeal"), dealController.updateDeal);
router.patch("/:id/deactivate", authorize("DeactivateDeal"), dealController.deactivateDeal);
router.patch("/:id/reactivate", authorize("ReactivateDeal"), dealController.reactivateDeal);
router.delete("/:id/delete", authorize("DeleteDeal"), dealController.deleteDeal);

module.exports = router;
