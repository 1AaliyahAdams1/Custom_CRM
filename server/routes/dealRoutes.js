const express = require("express");
const router = express.Router();
const dealController = require("../controllers/dealController");

router.get("/", dealController.getAllDeals);
router.get("/:id", dealController.getDealById);
router.post("/", dealController.createDeal);
router.put("/:id", dealController.updateDeal);
router.patch("/:id/deactivate", dealController.deactivateDeal);
router.patch("/:id/reactivate", dealController.reactivateDeal);
router.delete("/:id/delete", dealController.deleteDeal);

module.exports = router;
