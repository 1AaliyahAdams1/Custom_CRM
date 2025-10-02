const { sql, poolPromise } = require("../dbConfig");

// =======================
// Get EntityTypeID by TypeName
// =======================
async function getEntityTypeId(typeName) {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("typeName", sql.VarChar, typeName)
      .query(`SELECT EntityTypeID FROM EntityType WHERE TypeName = @typeName`);

    if (result.recordset.length === 0) {
      throw new Error(`EntityType '${typeName}' not found`);
    }

    return result.recordset[0].EntityTypeID;
  } catch (error) {
    console.error("Database error in getEntityTypeId:", error);
    throw error;
  }
}

// =======================
// Create Attachment
// =======================
async function addAttachment(entityId, entityTypeName, fileUrl, createdBy) {
  try {
    const pool = await poolPromise;
    const entityTypeId = await getEntityTypeId(entityTypeName);

    await pool.request()
      .input("EntityID", sql.Int, entityId)
      .input("EntityTypeID", sql.Int, entityTypeId)
      .input("FileUrl", sql.VarChar, fileUrl)
      .input("CreatedBy", sql.VarChar, createdBy) 
      .execute("CreateAttachment");

    return { message: `Attachment added to ${entityTypeName} successfully` };
  } catch (error) {
    console.error("Database error in addAttachment:", error);
    throw error;
  }
}

// =======================
// Get all Attachments for an entity
// =======================
async function getAttachments(entityId, entityTypeName) {
  try {
    const pool = await poolPromise;
    const entityTypeId = await getEntityTypeId(entityTypeName);

    const result = await pool.request().execute("GetAttachment");

    return result.recordset
      .filter(att => 
        att.EntityID === entityId && 
        att.EntityTypeID === entityTypeId &&
        (att.Active === 1 || att.Active === null) 
      )
      .sort((a, b) => new Date(b.UploadedAt) - new Date(a.UploadedAt));
  } catch (error) {
    console.error("Database error in getAttachments:", error);
    throw error;
  }
}

// =======================
// Get Attachment by ID
// =======================
async function getAttachmentById(attachmentId) {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("AttachmentID", sql.Int, attachmentId)
      .execute("GetAttachmentByID");

    return result.recordset[0];
  } catch (error) {
    console.error("Database error in getAttachmentById:", error);
    throw error;
  }
}

// =======================
// Update Attachment by ID 
// =======================
async function updateAttachment(attachmentId, entityId, entityTypeName, fileUrl) {
  try {
    const pool = await poolPromise;
    const entityTypeId = await getEntityTypeId(entityTypeName);

    await pool.request()
      .input("AttachmentID", sql.Int, attachmentId)
      .input("EntityID", sql.Int, entityId)
      .input("EntityTypeID", sql.Int, entityTypeId)
      .input("FileUrl", sql.VarChar, fileUrl) 
      .execute("UpdateAttachment");

    return { message: "Attachment updated successfully" };
  } catch (error) {
    console.error("Database error in updateAttachment:", error);
    throw error;
  }
}

// =======================
// Deactivate Attachment by ID
// =======================
async function deactivateAttachment(attachmentId) {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("AttachmentID", sql.Int, attachmentId)
      .execute("DeactivateAttachment");
      
    return { message: "Attachment deactivated successfully" };
  } catch (error) {
    console.error("Database error in deactivateAttachment:", error);
    throw error;
  }
}

// =======================
// Reactivate Attachment by ID
// =======================
async function reactivateAttachment(attachmentId) {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("AttachmentID", sql.Int, attachmentId)
      .execute("ReactivateAttachment");
      
    return { message: "Attachment reactivated successfully" };
  } catch (error) {
    console.error("Database error in reactivateAttachment:", error);
    throw error;
  }
}

// =======================
// Delete Attachment by ID
// =======================
async function deleteAttachment(attachmentId) {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("AttachmentID", sql.Int, attachmentId)
      .execute("DeleteAttachment");
      
    return { message: "Attachment deleted successfully" };
  } catch (error) {
    console.error("Database error in deleteAttachment:", error);
    throw error;
  }
}

// =======================
// Get all attachments
// =======================
async function getAllAttachments() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .query(`
        SELECT
            att.[AttachmentID],
            att.[EntityID],
            att.[EntityTypeID],
            et.[TypeName] AS EntityTypeName,
            att.[FileName],
            att.[FileUrl],
            att.[UploadedAt]
        FROM [8589_CRM].[dbo].[Attachment] att
        LEFT JOIN [8589_CRM].[dbo].[EntityType] et 
            ON att.EntityTypeID = et.EntityTypeID
        ORDER BY att.UploadedAt DESC;
      `);

    return result.recordset;
  } catch (error) {
    console.error("Attachment Repo Error [getAllAttachments]:", error);
    throw error;
  }
}

// =======================
// Exports
// =======================
module.exports = {
  addAttachment,
  getAttachments,
  getAttachmentById,
  updateAttachment,
  deactivateAttachment,
  reactivateAttachment,
  deleteAttachment,
  getAllAttachments
};