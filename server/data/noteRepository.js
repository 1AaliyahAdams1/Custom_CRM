const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

// =======================
// Helper to get EntityTypeID by TypeName (e.g., 'Contact', 'Activity')
// =======================
async function getEntityTypeId(typeName) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("typeName", sql.VarChar, typeName)
      .query(`SELECT EntityTypeID FROM EntityType WHERE TypeName = @typeName`);

    if (result.recordset.length === 0) {
      throw new Error(`EntityType '${typeName}' not found`);
    }
    return result.recordset[0].EntityTypeID;
  } catch (error) {
    console.error("Error fetching EntityTypeID:", error);
    throw error;
  }
}

// =======================
// Add Note
// =======================
async function addNote(entityId, entityTypeName, content) {
  try {
    const pool = await sql.connect(dbConfig);
    const entityTypeId = await getEntityTypeId(entityTypeName);

    await pool.request()
      .input("EntityID", sql.Int, entityId)
      .input("EntityTypeID", sql.Int, entityTypeId)
      .input("Content", sql.VarChar, content)
      .query(`
        INSERT INTO Note (EntityID, EntityTypeID, Content, CreatedAt)
        VALUES (@EntityID, @EntityTypeID, @Content, GETDATE())
      `);

    return { message: `Note added to ${entityTypeName} successfully` };
  } catch (error) {
    console.error("Error adding note:", error);
    throw error;
  }
}

// =======================
// Update Note
// =======================
async function updateNote(noteId, content) {
  try {
    const pool = await sql.connect(dbConfig);

    await pool.request()
      .input("NoteID", sql.Int, noteId)
      .input("Content", sql.VarChar, content)
      .query(`
        UPDATE Note
        SET Content = @Content,
            CreatedAt = GETDATE()
        WHERE NoteID = @NoteID
      `);

    return { message: "Note updated successfully" };
  } catch (error) {
    console.error("Error updating note:", error);
    throw error;
  }
}

// =======================
// Delete Note
// =======================
async function deleteNote(noteId) {
  try {
    const pool = await sql.connect(dbConfig);

    await pool.request()
      .input("NoteID", sql.Int, noteId)
      .query(`DELETE FROM Note WHERE NoteID = @NoteID`);

    return { message: "Note deleted successfully" };
  } catch (error) {
    console.error("Error deleting note:", error);
    throw error;
  }
}

// =======================
// Fetch Notes for entity
// =======================
async function getNotes(entityId, entityTypeName) {
  try {
    const pool = await sql.connect(dbConfig);
    const entityTypeId = await getEntityTypeId(entityTypeName);

    const result = await pool.request()
      .input("EntityID", sql.Int, entityId)
      .input("EntityTypeID", sql.Int, entityTypeId)
      .query(`
        SELECT NoteID, Content, CreatedAt
        FROM Note 
        WHERE EntityID = @EntityID AND EntityTypeID = @EntityTypeID
        ORDER BY CreatedAt DESC
      `);

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
// Exports
// =======================
module.exports = {
  addNote,
  updateNote,
  deleteNote,
  getNotes,
};
