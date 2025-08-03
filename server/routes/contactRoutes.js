const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");

router.get("/", contactController.getAllContacts);
router.get("/:id", contactController.getContactById);
router.post("/", contactController.createContact);
router.put("/:id", contactController.updateContact);
router.patch("/:id/deactivate", contactController.deactivateContact);
router.patch("/:id/reactivate", contactController.reactivateContact);
router.delete("/:id/delete", contactController.deleteContact);
router.get("/account/:accountName", contactController.getContactsByAccountId);

module.exports = router;
