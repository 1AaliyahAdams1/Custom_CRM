const express = require("express");
const router = express.Router();
const { claimAccount, assignUser, removeAssignedUser } = require("../controllers/assignUserController");
const { authenticateJWT } = require("../middleware/authMiddleware");

router.patch("/:id/claim", authenticateJWT, claimAccount);
router.post("/:id/assign", authenticateJWT, assignUser);
router.delete("/:accountUserId", authenticateJWT, removeAssignedUser);

module.exports = router;
