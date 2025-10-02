const noteService = require("../services/noteService");

// =======================
// Get all notes
// =======================
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
    // Get userId from authenticated user (adjust based on your auth setup)
    const userId = req.user?.id || req.userId || req.body.CreatedBy;
    
    if (!userId) {
      return res.status(401).json({ message: "User authentication required" });
    }
    
    const updatedNotes = await noteService.createNote(noteData, userId);
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
    // Get userId from authenticated user (adjust based on your auth setup)
    const userId = req.user?.id || req.userId || req.body.UserId;
    
    if (!userId) {
      return res.status(401).json({ message: "User authentication required" });
    }
    
    const updatedNotes = await noteService.updateNote(noteId, noteData, userId);
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
    // Get userId from authenticated user (adjust based on your auth setup)
    const userId = req.user?.id || req.userId || req.body.UserId;
    
    if (!userId) {
      return res.status(401).json({ message: "User authentication required" });
    }
    
    const result = await noteService.deactivateNote(noteId, userId);
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
    // Get userId from authenticated user (adjust based on your auth setup)
    const userId = req.user?.id || req.userId || req.body.UserId;
    
    if (!userId) {
      return res.status(401).json({ message: "User authentication required" });
    }
    
    const result = await noteService.reactivateNote(noteId, userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

module.exports = {
  getNotes,
  createNote,
  updateNote,
  deactivateNote,
  reactivateNote,
  getAllNotes
};