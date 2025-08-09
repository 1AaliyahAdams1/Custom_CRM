const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const { authenticateJWT } = require("../middleware/authMiddleware");
const requireRoles = require("../middleware/requireRoles");

// Protect routes with JWT and role-based authorization
router.get("/", authenticateJWT, requireRoles("C-level", "Sales Manager"), accountController.getAllAccounts);
router.get("/:id", authenticateJWT, requireRoles("C-level", "Sales Manager"), accountController.getAccountById);
router.post("/", authenticateJWT, requireRoles("C-level"), accountController.createAccount);
router.put("/:id", authenticateJWT, requireRoles("C-level"), accountController.updateAccount);
router.patch("/:id/deactivate", authenticateJWT, requireRoles("C-level"), accountController.deactivateAccount);
router.patch("/:id/reactivate", authenticateJWT, requireRoles("C-level"), accountController.reactivateAccount);
router.delete("/:id/delete", authenticateJWT, requireRoles("C-level"), accountController.deleteAccount);

module.exports = router;
