const express = require("express");
const router = express.Router();
const noteController = require("../controllers/noteController");

// Get notes for entity (query params: entityId, entityTypeName)
router.get("/", noteController.getNotes);

// Create new note
router.post("/", noteController.createNote);

// Update note
router.put("/:id", noteController.updateNote);

// Deactivate note (soft delete)
router.patch("/:id/deactivate", noteController.deactivateNote);

// Reactivate note
router.patch("/:id/reactivate", noteController.reactivateNote);

// Delete note (hard delete)
router.delete("/:id", noteController.deleteNote);

// Get notes by AccountID
router.get("/account/:accountId", noteController.getNotesByAccountID);

module.exports = router;
