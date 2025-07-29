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
// Add Attachment
// =======================
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

// =======================
// Update Attachment
// =======================
async function updateAttachment(attachmentId, fileName, fileUrl) {
  try {
    const pool = await sql.connect(dbConfig);

    await pool.request()
      .input("AttachmentID", sql.Int, attachmentId)
      .input("FileName", sql.VarChar, fileName)
      .input("FileUrl", sql.VarChar, fileUrl)
      .query(`
        UPDATE Attachment
        SET FileName = @FileName,
            FileUrl = @FileUrl,
            UploadedAt = GETDATE()
        WHERE AttachmentID = @AttachmentID
      `);

    return { message: "Attachment updated successfully" };
  } catch (error) {
    console.error("Error updating attachment:", error);
    throw error;
  }
}

// =======================
// Delete Attachment
// =======================
async function deleteAttachment(attachmentId) {
  try {
    const pool = await sql.connect(dbConfig);

    await pool.request()
      .input("AttachmentID", sql.Int, attachmentId)
      .query(`DELETE FROM Attachment WHERE AttachmentID = @AttachmentID`);

    return { message: "Attachment deleted successfully" };
  } catch (error) {
    console.error("Error deleting attachment:", error);
    throw error;
  }
}

// =======================
// Fetch Attachments for entity
// =======================
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

//All stored procedures
//CreateAttachment
// GetAttachment
// GetAttachmentByID
// UpdateAttachment
// DeactivateAttachment
// ReactivateAttachment
// DeleteAttachment

// =======================
// Exports
// =======================
module.exports = {
  addAttachment,
  updateAttachment,
  deleteAttachment,
  getAttachments,
};
