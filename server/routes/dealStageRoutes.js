const express = require("express");
const router = express.Router();
const dealStageController = require("../controllers/dealStageController");

// GET /dealstage - fetch all deal stages
router.get("/", dealStageController.getAllDealStages);

module.exports = router;
