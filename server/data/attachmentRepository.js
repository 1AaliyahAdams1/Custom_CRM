const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

// =======================
// Helper: Get EntityTypeID by TypeName
// =======================
async function getEntityTypeId(typeName) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("typeName", sql.VarChar, typeName)
    .query(`SELECT EntityTypeID FROM EntityType WHERE TypeName = @typeName`);

  if (result.recordset.length === 0) {
    throw new Error(`EntityType '${typeName}' not found`);
  }
  return result.recordset[0].EntityTypeID;
}

// =======================
// Create Attachment
// =======================
async function addAttachment(entityId, entityTypeName, fileName, fileUrl) {
  const pool = await sql.connect(dbConfig);
  const entityTypeId = await getEntityTypeId(entityTypeName);

  await pool.request()
    .input("EntityID", sql.Int, entityId)
    .input("EntityTypeID", sql.Int, entityTypeId)
    .input("FileName", sql.VarChar, fileName)
    .input("FileUrl", sql.VarChar, fileUrl)
    .execute("CreateAttachment");

  return { message: `Attachment added to ${entityTypeName} successfully` };
}

// =======================
// Get all Attachments for an entity
// =======================
async function getAttachments(entityId, entityTypeName) {
  const pool = await sql.connect(dbConfig);
  const entityTypeId = await getEntityTypeId(entityTypeName);

  const result = await pool.request()
    .execute("GetAttachment");

  // Filter attachments in code by EntityID and EntityTypeID, order by UploadedAt desc
  const filtered = result.recordset
    .filter(att => att.EntityID === entityId && att.EntityTypeID === entityTypeId)
    .sort((a, b) => new Date(b.UploadedAt) - new Date(a.UploadedAt));

  return filtered;
}

// =======================
// Get Attachment by ID
// =======================
async function getAttachmentById(attachmentId) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("AttachmentID", sql.Int, attachmentId)
    .execute("GetAttachmentByID");
  return result.recordset[0];
}

// =======================
// Update Attachment by ID
// =======================
async function updateAttachment(attachmentId, entityId, entityTypeName, fileName, fileUrl) {
  const pool = await sql.connect(dbConfig);
  const entityTypeId = await getEntityTypeId(entityTypeName);

  await pool.request()
    .input("AttachmentID", sql.Int, attachmentId)
    .input("EntityID", sql.Int, entityId)
    .input("EntityTypeID", sql.Int, entityTypeId)
    .input("FileName", sql.VarChar, fileName)
    .input("FileUrl", sql.VarChar, fileUrl)
    .execute("UpdateAttachment");

  return { message: "Attachment updated successfully" };
}

// =======================
// Deactivate Attachment by ID
// =======================
async function deactivateAttachment(attachmentId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("AttachmentID", sql.Int, attachmentId)
    .execute("DeactivateAttachment");
}

// =======================
// Reactivate Attachment by ID
// =======================
async function reactivateAttachment(attachmentId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("AttachmentID", sql.Int, attachmentId)
    .execute("ReactivateAttachment");
}

// =======================
// Delete Attachment by ID
// =======================
async function deleteAttachment(attachmentId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("AttachmentID", sql.Int, attachmentId)
    .execute("DeleteAttachment");
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
  getAttachments,
  getAttachmentById,
  updateAttachment,
  deactivateAttachment,
  reactivateAttachment,
  deleteAttachment,
};
