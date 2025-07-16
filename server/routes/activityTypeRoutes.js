const express = require("express");
const router = express.Router();
const controller = require("../controllers/activityTypeController");

// Define GET route to return all activity types for dropdown
router.get("/", controller.getAll);

module.exports = router;
