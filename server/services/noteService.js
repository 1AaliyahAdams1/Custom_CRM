const noteRepo = require("../data/noteRepository");

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
async function createNote(data, userId) {
  const { EntityID, EntityTypeName, Content } = data;
  
  if (!EntityID || !EntityTypeName || !Content) {
    throw new Error("EntityID, EntityTypeName, and Content are required");
  }
  if (!userId) {
    throw new Error("User ID is required");
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
async function updateNote(noteId, data, userId) {
  const { EntityID, EntityTypeName, Content } = data;
  
  if (!noteId || !EntityID || !EntityTypeName || !Content) {
    throw new Error("NoteID, EntityID, EntityTypeName, and Content are required");
  }
  if (!userId) {
    throw new Error("User ID is required");
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
async function deactivateNote(noteId, userId) {
  if (!noteId) {
    throw new Error("NoteID is required");
  }
  if (!userId) {
    throw new Error("User ID is required");
  }
  return await noteRepo.deactivateNote(noteId, userId);
}

// =======================
// Reactivate note
// =======================
async function reactivateNote(noteId, userId) {
  if (!noteId) {
    throw new Error("NoteID is required");
  }
  if (!userId) {
    throw new Error("User ID is required");
  }
  return await noteRepo.reactivateNote(noteId, userId);
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
  getAllNotes
};