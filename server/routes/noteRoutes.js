const express = require("express");
const router = express.Router();
const noteController = require("../controllers/noteController");

router.get("/all", noteController.getAllNotes);

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

module.exports = router;