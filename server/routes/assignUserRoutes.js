const express = require("express");
const router = express.Router();
const { claimAccount, assignUser,removeSpecificUsers, removeAssignedUser,  } = require("../controllers/assignUserController");
const { authenticateJWT } = require("../middleware/authMiddleware");

// Claim account
router.patch("/:id/claim", authenticateJWT, claimAccount);

// Assign user to account
router.post("/:id/assign", authenticateJWT, assignUser);

// Remove specific users from account (place BEFORE the generic /:accountUserId route)
router.delete("/account/:accountId/users", authenticateJWT, removeSpecificUsers);

// Remove single assigned user (place AFTER specific routes)
router.delete("/:accountUserId", authenticateJWT, removeAssignedUser);

module.exports = router;