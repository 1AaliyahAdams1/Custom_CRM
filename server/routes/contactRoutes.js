const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");

// Get all contacts
router.get("/", contactController.getContacts);

// Get all persons for dropdown
router.get("/persons", contactController.getPersons);

// Create new contact
router.post("/", contactController.createContact);

// Update existing contact
router.put("/:id", contactController.updateContact);

// Delete contact
router.delete("/:id", contactController.deleteContact);

// Get contact details (should be last to avoid conflicts)
router.get("/:id", contactController.getContactDetails);

module.exports = router;