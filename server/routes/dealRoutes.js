const express = require("express");
const router = express.Router();
const dealController = require("../controllers/dealController");

router.get("/", dealController.getDeals);
router.post("/", dealController.createDeal);
router.put("/:id", dealController.updateDeal);
router.delete("/:id", dealController.deleteDeal);
router.get("/:id", dealController.getDealDetails);


module.exports = router;
