const { sql, poolPromise } = require("../dbConfig");

// =======================
// get EntityTypeID by TypeName
// =======================
async function getEntityTypeId(typeName) {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input("TypeName", sql.VarChar(100), typeName);
    const result = await request.query(
      "SELECT EntityTypeID FROM EntityType WHERE TypeName = @TypeName AND Active = 1"
    );

    if (result.recordset.length === 0) {
      throw new Error(`EntityType '${typeName}' not found or inactive`);
    }
    return result.recordset[0].EntityTypeID;
  } catch (error) {
    console.error("Database error in getEntityTypeId:", error);
    throw error;
  }
}

// =======================
// Get notes for entity
// =======================
async function getNotes(entityId, entityTypeName) {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    const entityTypeId = await getEntityTypeId(entityTypeName);

    request.input("EntityID", sql.Int, entityId);
    request.input("TypeName", sql.VarChar(100), entityTypeName);
    request.input("EntityTypeID", sql.Int, entityTypeId);

    const result = await request.execute("getNotes");
    return result.recordset || [];
  } catch (error) {
    console.error("Database error in getNotes:", error);
    throw error;
  }
}

// =======================
// Create note
// =======================
async function createNote(entityId, entityTypeName, content, userId) {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    const entityTypeId = await getEntityTypeId(entityTypeName);

    request.input("EntityID", sql.Int, entityId);
    request.input("EntityTypeID", sql.Int, entityTypeId);
    request.input("Content", sql.VarChar(255), content);
    request.input("CreatedBy", sql.Int, userId);

    await request.execute("createNote"); // no recordset expected
    return { message: `Note added to ${entityTypeName} successfully` };
  } catch (error) {
    console.error("Database error in createNote:", error);
    throw error;
  }
}

// =======================
// Update note
// =======================
async function updateNote(noteId, entityId, entityTypeName, content, userId) {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    const entityTypeId = await getEntityTypeId(entityTypeName);

    request.input("NoteID", sql.Int, noteId);
    request.input("EntityID", sql.Int, entityId);
    request.input("EntityTypeID", sql.Int, entityTypeId);
    request.input("Content", sql.VarChar(255), content);

    await request.execute("updateNote");
    return { message: "Note updated successfully" };
  } catch (error) {
    console.error("Database error in updateNote:", error);
    throw error;
  }
}

// =======================
// Deactivate note
// =======================
async function deactivateNote(noteId, userId) {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input("NoteID", sql.Int, noteId);
    await request.execute("deactivateNote");
    return { message: "Note deactivated successfully" };
  } catch (error) {
    console.error("Database error in deactivateNote:", error);
    throw error;
  }
}

// =======================
// Reactivate note
// =======================
async function reactivateNote(noteId, userId) {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input("NoteID", sql.Int, noteId);
    await request.execute("reactivateNote");
    return { message: "Note reactivated successfully" };
  } catch (error) {
    console.error("Database error in reactivateNote:", error);
    throw error;
  }
}

// =======================
// Delete note
// =======================
async function deleteNote(noteId, userId) {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input("NoteID", sql.Int, noteId);
    await request.execute("deleteNote");
    return { message: "Note deleted successfully" };
  } catch (error) {
    console.error("Database error in deleteNote:", error);
    throw error;
  }
}
// =======================
// Get all notes
// =======================
async function getAllNotes() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .query(`
        SELECT
            n.[NoteID],
            n.[EntityID],
            n.[EntityTypeID],
            n.[Content],
            n.[CreatedAt]
        FROM [8589_CRM].[dbo].[Note] n
        ORDER BY n.[CreatedAt] DESC;
      `);

    return result.recordset;
  } catch (error) {
    console.error("Note Repo Error [getAllNotes]:", error.message);
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
  getAllNotes
};
