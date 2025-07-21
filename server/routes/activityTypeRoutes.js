const express = require("express");
const router = express.Router();
const activityTypeController = require("../controllers/activityTypeController");

router.get("/", activityTypeController.getAll);

module.exports = router;
