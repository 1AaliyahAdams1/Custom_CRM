const express = require("express");
const router = express.Router();
const { claimAccount, assignUser } = require("../controllers/assignUserController");
const { authenticateJWT } = require("../middleware/authMiddleware");

// Sales rep claims account for themselves
router.patch("/:id/claim", authenticateJWT, claimAccount);

// C-level assigns another user
router.post("/:id/assign", authenticateJWT, assignUser);

module.exports = router;
