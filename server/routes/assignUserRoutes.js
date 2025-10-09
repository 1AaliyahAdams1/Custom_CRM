const express = require("express");
const router = express.Router();
const { claimAccount,unclaimAccount, assignUser,removeSpecificUsers, removeAssignedUser,  } = require("../controllers/assignUserController");
const { authenticateJWT } = require("../middleware/authMiddleware");

// Claim account
router.patch("/:id/claim", authenticateJWT, claimAccount);

// Unclaim account
router.patch("/:id/unclaim", authenticateJWT, unclaimAccount);

// Assign user to account
router.post("/:id/assign", authenticateJWT, assignUser);

// Remove specific users from account
router.delete("/account/:accountId/users", authenticateJWT, removeSpecificUsers);

// Remove single assigned user 
router.delete("/:accountUserId", authenticateJWT, removeAssignedUser);



module.exports = router;