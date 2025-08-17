const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");

// Public/basic routes
router.get("/", accountController.getAllAccounts);
router.get("/unassigned", accountController.getActiveUnassignedAccounts);
router.get("/user/:userId", accountController.getActiveAccountsByUser);
router.get("/:id", accountController.getAccountDetails);

// Create account (with validation middleware)
router.post(
  "/",
  accountController.validateAccount, // apply validation rules
  accountController.createAccount
);

// Update account (with validation middleware)
router.put(
  "/:id",
  accountController.validateAccount, // apply validation rules
  accountController.updateAccount
);

// Deactivate account
router.patch("/:id/deactivate", accountController.deactivateAccount);

// Reactivate account
router.patch("/:id/reactivate", accountController.reactivateAccount);

// Delete account
router.delete("/:id/delete", accountController.deleteAccount);

module.exports = router;

//ROLE ACCESS FOR BACKEND
// const express = require("express");
// const router = express.Router();
// const accountController = require("../controllers/accountController");
// const { authenticateJWT } = require("../middleware/authMiddleware");
// const { authorizeRoleDynamic } = require("../middleware/authorizeRoleMiddleware");

// // Get all accounts - restricted to C-level, Sales Manager, Sales Rep
// router.get(
//   "/",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level", "Sales Manager", "Sales Representative"], "account"),
//   accountController.getAllAccounts
// );

// // Get specific account by ID
// router.get(
//   "/:id",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level", "Sales Manager", "Sales Representative"], "account"),
//   accountController.getAccountById
// );

// // Create new account - only C-level
// router.post(
//   "/",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level"], "account"),
//   accountController.createAccount
// );

// // Update account - only C-level
// router.put(
//   "/:id",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level"], "account"),
//   accountController.updateAccount
// );

// // Deactivate account (soft delete) - only C-level
// router.patch(
//   "/:id/deactivate",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level"], "account"),
//   accountController.deactivateAccount
// );

// // Reactivate account - only C-level
// router.patch(
//   "/:id/reactivate",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level"], "account"),
//   accountController.reactivateAccount
// );

// // Permanently delete account (hard delete) - only C-level
// router.delete(
//   "/:id/delete",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level"], "account"),
//   accountController.deleteAccount
// );

// module.exports = router;
