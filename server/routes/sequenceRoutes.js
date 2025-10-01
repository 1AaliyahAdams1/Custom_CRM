const express = require("express");
const router = express.Router();
const sequenceController = require("../controllers/sequenceController");

//======================================
// SEQUENCE ROUTES
//======================================
router.get("/", sequenceController.getAllSequences);
router.get("/:id", sequenceController.getSequenceByID);
router.get("/:id/items", sequenceController.getSequenceWithItems);
router.post("/", sequenceController.createSequence);
router.put("/:id", sequenceController.updateSequence);
router.patch("/:id/deactivate", sequenceController.deactivateSequence);
router.patch("/:id/reactivate", sequenceController.reactivateSequence);
router.delete("/:id/delete", sequenceController.deleteSequence);

//======================================
// SEQUENCE ITEM ROUTES
//======================================
router.get("/items/:itemId", sequenceController.getSequenceItemByID);
router.post("/items", sequenceController.createSequenceItem);
router.put("/items/:itemId", sequenceController.updateSequenceItem);
router.delete("/items/:itemId", sequenceController.deleteSequenceItem);

// Create sequence with items in one transaction
router.post("/with-items", sequenceController.createSequenceWithItems);

// Assign/unassign sequence to account
router.post("/assign", sequenceController.assignSequenceToAccount);
router.delete("/unassign/:accountId", sequenceController.unassignSequenceFromAccount);

// Get accounts using a sequence
router.get("/:id/accounts", sequenceController.getAccountsBySequence);

module.exports = router;