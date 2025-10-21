const express = require("express");
const router = express.Router();
const sequenceController = require("../controllers/sequenceController");

//======================================
// SEQUENCE ROUTES
//======================================
router.get("/activity-types", sequenceController.getAllActivityTypes);
router.get("/", sequenceController.getAllSequences);
router.get("/items", sequenceController.getAllSequenceItems); 
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
router.patch("/items/:itemId/deactivate", sequenceController.deactivateSequenceItem); 
router.patch("/items/:itemId/reactivate", sequenceController.reactivateSequenceItem);  
router.delete("/items/:itemId", sequenceController.deleteSequenceItem);
router.post("/with-items", sequenceController.createSequenceWithItems);
router.post("/assign", sequenceController.assignSequenceToAccount);
router.delete("/unassign/:accountId", sequenceController.unassignSequenceFromAccount);
router.get("/:id/accounts", sequenceController.getAccountsBySequence);

module.exports = router;