const { sql, poolPromise } = require("../dbConfig");

// =======================
// Helper: Get EntityTypeID by TypeName
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
async function addAttachment(entityId, entityTypeName, fileName, fileUrl) {
  try {
    const pool = await poolPromise;
    const entityTypeId = await getEntityTypeId(entityTypeName);

    await pool.request()
      .input("EntityID", sql.Int, entityId)
      .input("EntityTypeID", sql.Int, entityTypeId)
      .input("FileName", sql.VarChar, fileName)
      .input("FileUrl", sql.VarChar, fileUrl)
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

    // Filter and sort in memory
    return result.recordset
      .filter(att => att.EntityID === entityId && att.EntityTypeID === entityTypeId)
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
async function updateAttachment(attachmentId, entityId, entityTypeName, fileName, fileUrl) {
  try {
    const pool = await poolPromise;
    const entityTypeId = await getEntityTypeId(entityTypeName);

    await pool.request()
      .input("AttachmentID", sql.Int, attachmentId)
      .input("EntityID", sql.Int, entityId)
      .input("EntityTypeID", sql.Int, entityTypeId)
      .input("FileName", sql.VarChar, fileName)
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
  } catch (error) {
    console.error("Database error in deleteAttachment:", error);
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
};
