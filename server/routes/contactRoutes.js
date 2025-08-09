const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");
const { authorize } = require("../middleware/accessControl"); 

router.get("/", authorize("View Contacts"), contactController.getAllContacts);
router.get("/:id", authorize("View Contacts"), contactController.getContactDetails);
router.post("/", authorize("Create Contacts"), contactController.createContact);
router.put("/:id", authorize("Edit Contacts"), contactController.updateContact);
router.patch("/:id/deactivate", authorize("Deactivate Contacts"), contactController.deactivateContact);
router.patch("/:id/reactivate", authorize("Reactivate Contacts"), contactController.reactivateContact);
router.delete("/:id/delete", authorize("Delete Contacts"), contactController.deleteContact);
router.get("/account/:accountName", authorize("View Contacts"), contactController.getContactsByAccountId);

module.exports = router;
