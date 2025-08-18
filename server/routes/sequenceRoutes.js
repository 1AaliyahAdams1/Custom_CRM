const express = require("express");
const router = express.Router();
const sequenceController = require("../controllers/sequenceController");

router.get("/user/:userId/sequences-items", sequenceController.getSequencesandItemsByUser);
router.get("/user/:userId", sequenceController.getUserSequences);
router.get("/user/:userId/activities", sequenceController.getActivitiesByUser);

module.exports = router;
