const noteRepo = require("../data/noteRepository");

// Hardcoded userId for now
const userId = 1;

// =======================
// Get notes for entity
// =======================
async function getNotes(entityId, entityTypeName) {
  if (!entityId || !entityTypeName) {
    throw new Error("EntityId and EntityTypeName are required");
  }
  return await noteRepo.getNotes(entityId, entityTypeName);
}

// =======================
// Create note
// =======================
async function createNote(data) {
  const { EntityID, EntityTypeName, Content } = data;

  if (!EntityID || !EntityTypeName || !Content) {
    throw new Error("EntityID, EntityTypeName, and Content are required");
  }

  if (Content.trim().length === 0) {
    throw new Error("Note content cannot be empty");
  }

  if (Content.length > 255) {
    throw new Error("Note content must be 255 characters or less");
  }

  await noteRepo.createNote(EntityID, EntityTypeName, Content.trim(), userId);
  // fetch updated notes immediately for front-end
  return await noteRepo.getNotes(EntityID, EntityTypeName);
}

// =======================
// Update note
// =======================
async function updateNote(noteId, data) {
  const { EntityID, EntityTypeName, Content } = data;

  if (!noteId || !EntityID || !EntityTypeName || !Content) {
    throw new Error("NoteID, EntityID, EntityTypeName, and Content are required");
  }

  if (Content.trim().length === 0) {
    throw new Error("Note content cannot be empty");
  }

  if (Content.length > 255) {
    throw new Error("Note content must be 255 characters or less");
  }

  await noteRepo.updateNote(noteId, EntityID, EntityTypeName, Content.trim(), userId);
  return await noteRepo.getNotes(EntityID, EntityTypeName);
}

// =======================
// Deactivate note
// =======================
async function deactivateNote(noteId) {
  if (!noteId) {
    throw new Error("NoteID is required");
  }
  return await noteRepo.deactivateNote(noteId, userId);
}

// =======================
// Reactivate note
// =======================
async function reactivateNote(noteId) {
  if (!noteId) {
    throw new Error("NoteID is required");
  }
  return await noteRepo.reactivateNote(noteId, userId);
}

// =======================
// Delete note
// =======================
async function deleteNote(noteId) {
  if (!noteId) {
    throw new Error("NoteID is required");
  }
  return await noteRepo.deleteNote(noteId, userId);
}

// =======================
// Get notes by AccountID
// =======================
async function getNotesByAccountID(accountId) {
  if (!accountId) {
    throw new Error("AccountID is required");
  }
  return await noteRepo.getNotesByAccountID(accountId);
}

// =======================
// Get all notes
// =======================
async function getAllNotes() {
  try {
    return await noteRepo.getAllNotes();
  } catch (error) {
    console.error("Error in getAllNotes service:", error);
      throw error;
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
