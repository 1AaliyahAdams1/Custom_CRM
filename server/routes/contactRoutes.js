const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");
router.get("/", contactController.getAllContactDetails);
router.get("/:id", contactController.getContactDetails);
router.post("/", contactController.createContact);
router.put("/:id", contactController.updateContact);
router.patch("/:id/deactivate", contactController.deactivateContact);
router.patch("/:id/reactivate", contactController.reactivateContact);
router.delete("/:id/delete", contactController.deleteContact);
router.get("/account/:accountName", contactController.getContactsByAccountId);
router.get("/user/:userId", contactController.getContactsByUser); 

module.exports = router;



//ROLE BASED ACCESS BACKEND
// const express = require("express");
// const router = express.Router();
// const contactController = require("../controllers/contactController");
// const { authenticateJWT } = require("../middleware/authMiddleware");
// const { authorizeRoleDynamic } = require("../middleware/authorizeRoleMiddleware");

// // Get all contacts - only C-level and Sales Manager
// router.get(
//   "/",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level", "Sales Manager"], "contact"),
//   contactController.getAllContactDetails
// );

// // Get specific contact by ID - C-level, Sales Manager, Salesperson (not Sales Representative)
// router.get(
//   "/:id",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level", "Sales Manager", "Salesperson"], "contact"),
//   contactController.getContactDetails
// );

// // Create new contact - only C-level
// router.post(
//   "/",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level"], "contact"),
//   contactController.createContact
// );

// // Update contact - only C-level
// router.put(
//   "/:id",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level"], "contact"),
//   contactController.updateContact
// );

// // Deactivate contact - only C-level
// router.patch(
//   "/:id/deactivate",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level"], "contact"),
//   contactController.deactivateContact
// );

// // Reactivate contact - only C-level
// router.patch(
//   "/:id/reactivate",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level"], "contact"),
//   contactController.reactivateContact
// );

// // Permanently delete contact - only C-level
// router.delete(
//   "/:id/delete",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level"], "contact"),
//   contactController.deleteContact
// );

// // Get contacts by account - only C-level and Sales Manager
// router.get(
//   "/account/:accountName",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level", "Sales Manager"], "contact"),
//   contactController.getContactsByAccountId
// );

// module.exports = router;
