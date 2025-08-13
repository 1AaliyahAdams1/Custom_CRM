const sql = require("mssql");
const dbConfig = require("../dbConfig");

// =======================
// Helper: get EntityTypeID by TypeName
// =======================
async function getEntityTypeId(typeName) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("TypeName", sql.VarChar(100), typeName)
      .query("SELECT EntityTypeID FROM EntityType WHERE TypeName = @TypeName AND Active = 1");

    if (result.recordset.length === 0) {
      throw new Error(`EntityType '${typeName}' not found or inactive`);
    }
    return result.recordset[0].EntityTypeID;
  } catch (error) {
    console.error("Error fetching EntityTypeID:", error);
    throw error;
  }
}

// =======================
// Get notes for entity
// =======================
async function getNotes(entityId, entityTypeName) {
  try {
    const pool = await sql.connect(dbConfig);
    const entityTypeId = await getEntityTypeId(entityTypeName);

    const result = await pool.request()
      .input("EntityID", sql.Int, entityId)
      .input("EntityTypeID", sql.Int, entityTypeId)
      .execute("getNotes");

    return result.recordset;
  } catch (error) {
    console.error("Error fetching notes:", error);
    throw error;
  }
}

//All stored procedures
//getNotes
//createNote
//updateNote
//deactivateNote
//reactivateNote
//deleteNote

// =======================
// Add note
// =======================
async function addNote(entityId, entityTypeName, content) {
  try {
    const pool = await sql.connect(dbConfig);
    const entityTypeId = await getEntityTypeId(entityTypeName);

    await pool.request()
      .input("EntityID", sql.Int, entityId)
      .input("EntityTypeID", sql.Int, entityTypeId)
      .input("Content", sql.VarChar(255), content)
      .execute("createNote");

    return { message: `Note added to ${entityTypeName} successfully` };
  } catch (error) {
    console.error("Error adding note:", error);
    throw error;
  }
}

// =======================
// Update note
// =======================
async function updateNote(noteId, entityId, entityTypeName, content) {
  try {
    const pool = await sql.connect(dbConfig);
    const entityTypeId = await getEntityTypeId(entityTypeName);

    await pool.request()
      .input("NoteID", sql.Int, noteId)
      .input("EntityID", sql.Int, entityId)
      .input("EntityTypeID", sql.Int, entityTypeId)
      .input("Content", sql.VarChar(255), content)
      .execute("updateNote");

    return { message: "Note updated successfully" };
  } catch (error) {
    console.error("Error updating note:", error);
    throw error;
  }
}

// =======================
// Deactivate note
// =======================
async function deactivateNote(noteId) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("NoteID", sql.Int, noteId)
      .execute("deactivateNote");

    return { message: "Note deactivated successfully" };
  } catch (error) {
    console.error("Error deactivating note:", error);
    throw error;
  }
}

// =======================
// Reactivate note
// =======================
async function reactivateNote(noteId) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("NoteID", sql.Int, noteId)
      .execute("reactivateNote");

    return { message: "Note reactivated successfully" };
  } catch (error) {
    console.error("Error reactivating note:", error);
    throw error;
  }
}

// =======================
// Delete note
// =======================
async function deleteNote(noteId) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("NoteID", sql.Int, noteId)
      .execute("deleteNote");

    return { message: "Note deleted successfully" };
  } catch (error) {
    console.error("Error deleting note:", error);
    throw error;
  }
}

// =======================
// Exports
// =======================
module.exports = {
  getNotes,
  addNote,
  updateNote,
  deactivateNote,
  reactivateNote,
  deleteNote,
};
