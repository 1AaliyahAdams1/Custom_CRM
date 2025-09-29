const noteService = require("../services/noteService");

async function getAllNotes(req, res) {
  try {
    const notes = await noteService.getAllNotes();
    res.json(notes);
  } catch (err) {
    console.error("Error getting all notes:", err);
    res.status(500).json({ error: "Failed to get notes" });
  }
}

// =======================
// Get notes for entity
// =======================
async function getNotes(req, res) {
  try {
    const { entityId, entityTypeName } = req.query;

    if (!entityId || !entityTypeName) {
      return res.status(400).json({
        message: "entityId and entityTypeName are required query parameters"
      });
    }

    const notes = await noteService.getNotes(parseInt(entityId), entityTypeName);
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// =======================
// Create note
// =======================
async function createNote(req, res) {
  try {
    const noteData = req.body;
    const updatedNotes = await noteService.createNote(noteData); // returns full updated notes
    res.status(201).json(updatedNotes);
  } catch (error) {
    if (error.message.includes("required") || error.message.includes("empty") || error.message.includes("characters")) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
}

// =======================
// Update note
// =======================
async function updateNote(req, res) {
  try {
    const noteId = parseInt(req.params.id);
    const noteData = req.body;
    const updatedNotes = await noteService.updateNote(noteId, noteData); // return full notes after update
    res.status(200).json(updatedNotes);
  } catch (error) {
    if (error.message.includes("required") || error.message.includes("empty") || error.message.includes("characters")) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
}

// =======================
// Deactivate note
// =======================
async function deactivateNote(req, res) {
  try {
    const noteId = parseInt(req.params.id);
    const result = await noteService.deactivateNote(noteId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// =======================
// Reactivate note
// =======================
async function reactivateNote(req, res) {
  try {
    const noteId = parseInt(req.params.id);
    const result = await noteService.reactivateNote(noteId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// =======================
// Delete note
// =======================
async function deleteNote(req, res) {
  try {
    const noteId = parseInt(req.params.id);
    const result = await noteService.deleteNote(noteId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
// =======================
// Get notes by Account ID
// =======================
async function getNotesByAccountID(req, res) {
  try {
    const accountId = parseInt(req.params.accountId, 10);
    if (isNaN(accountId)) {
      return res.status(400).json({ error: "Invalid account ID" });
    }

    const notes = await noteService.getNotesByAccountID(accountId);
    res.json(notes);
  } catch (err) {
    console.error("Error fetching notes by account ID:", err);
    res.status(500).json({ error: "Failed to get notes for account" });
  }
}

module.exports = {
  getNotes,
  createNote,
  updateNote,
  deactivateNote,
  reactivateNote,
  deleteNote,
  getNotesByAccountID,
  getAllNotes
};
