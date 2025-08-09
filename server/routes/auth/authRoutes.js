const express = require("express");
const router = express.Router();
const { getRolesByUserId } = require("../controllers/roleController");
const authController = require("../../controllers/auth/authController.js");
const { authenticateJWT } = require("../middleware/authMiddleware");

router.get("/roles", authenticateJWT, getRolesByUserId);
router.post("/login", authController.login);

module.exports = router;
