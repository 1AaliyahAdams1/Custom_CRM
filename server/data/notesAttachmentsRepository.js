const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

// Helper to get EntityTypeID by TypeName (e.g., 'Contact', 'Activity')
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

// Add Note
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

// Add Attachment
async function addAttachment(entityId, entityTypeName, fileName, fileUrl) {
  try {
    const pool = await sql.connect(dbConfig);
    const entityTypeId = await getEntityTypeId(entityTypeName);

    await pool.request()
      .input("EntityID", sql.Int, entityId)
      .input("EntityTypeID", sql.Int, entityTypeId)
      .input("FileName", sql.VarChar, fileName)
      .input("FileUrl", sql.VarChar, fileUrl)
      .query(`
        INSERT INTO Attachment (EntityID, EntityTypeID, FileName, FileUrl, UploadedAt)
        VALUES (@EntityID, @EntityTypeID, @FileName, @FileUrl, GETDATE())
      `);

    return { message: `Attachment added to ${entityTypeName} successfully` };
  } catch (error) {
    console.error("Error adding attachment:", error);
    throw error;
  }
}

// Fetch Notes for entity
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

// Fetch Attachments for entity
async function getAttachments(entityId, entityTypeName) {
  try {
    const pool = await sql.connect(dbConfig);
    const entityTypeId = await getEntityTypeId(entityTypeName);

    const result = await pool.request()
      .input("EntityID", sql.Int, entityId)
      .input("EntityTypeID", sql.Int, entityTypeId)
      .query(`
        SELECT AttachmentID, FileName, FileUrl, UploadedAt 
        FROM Attachment 
        WHERE EntityID = @EntityID AND EntityTypeID = @EntityTypeID
        ORDER BY UploadedAt DESC
      `);

    return result.recordset;
  } catch (error) {
    console.error("Error fetching attachments:", error);
    throw error;
  }
}

module.exports = {
  addNote,
  addAttachment,
  getNotes,
  getAttachments,
};
