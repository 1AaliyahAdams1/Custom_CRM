const express = require("express");
const router = express.Router();
const dealStageController = require("../controllers/dealStageController");

router.get("/", dealStageController.getAllDealStages);

module.exports = router;
