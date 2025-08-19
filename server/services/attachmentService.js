const attachmentRepo = require("../data/attachmentRepository");

// ==============================
// ATTACHMENT SERVICE FUNCTIONS - FIXED
// ==============================

// Helper function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper function to get file extension
function getFileExtension(filename) {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
}

// Helper function to format date
function formatDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// Upload Attachment
async function uploadAttachment(attachmentData) {
  try {
    const { entityId, entityTypeName, fileName, fileUrl } = attachmentData;
    
    if (!entityId || !entityTypeName || !fileName || !fileUrl) {
      throw new Error('Missing required attachment data');
    }

    const result = await attachmentRepo.addAttachment(
      parseInt(entityId),
      entityTypeName,
      fileName,
      fileUrl
    );
    
    return {
      success: true,
      message: result.message,
      data: {
        fileName,
        fileUrl,
        entityId: parseInt(entityId),
        entityTypeName
      }
    };
  } catch (error) {
    console.error("Error in uploadAttachment service:", error);
    throw error;
  }
}

// Get Attachments for Entity - FIXED
async function getAttachmentsForEntity(entityId, entityTypeName) {
  try {
    const rawData = await attachmentRepo.getAttachments(
      parseInt(entityId),
      entityTypeName
    );
    
    // Transform the data for better frontend consumption
    const transformedData = rawData.map(attachment => ({
      // Include both formats for compatibility
      AttachmentID: attachment.AttachmentID,
      attachmentId: attachment.AttachmentID,
      EntityID: attachment.EntityID,
      entityId: attachment.EntityID,
      EntityTypeID: attachment.EntityTypeID,
      entityTypeId: attachment.EntityTypeID,
      FileName: attachment.FileName,
      fileName: attachment.FileName,
      FileUrl: attachment.FileUrl,
      fileUrl: attachment.FileUrl,
      fileExtension: getFileExtension(attachment.FileName),
      UploadedAt: attachment.UploadedAt,
      uploadedAt: attachment.UploadedAt,
      formattedUploadDate: formatDate(attachment.UploadedAt),
      IsActive: attachment.IsActive,
      isActive: attachment.IsActive,
      // Add file type classification for UI
      fileType: classifyFileType(attachment.FileName),
      downloadUrl: `/attachments/${attachment.AttachmentID}/download`
    }));
    
    // Calculate summary
    const summary = {
      totalAttachments: transformedData.length,
      activeAttachments: transformedData.filter(att => att.isActive).length,
      fileTypes: [...new Set(transformedData.map(att => att.fileType))],
      lastUpload: transformedData.length > 0 ? transformedData[0].formattedUploadDate : null
    };
    
    return {
      data: transformedData,
      summary,
      filters: {
        entityId: parseInt(entityId),
        entityTypeName
      }
    };
  } catch (error) {
    console.error("Error in getAttachmentsForEntity service:", error);
    throw error;
  }
}

// Get Attachment by ID
async function getAttachmentById(attachmentId) {
  try {
    const rawData = await attachmentRepo.getAttachmentById(parseInt(attachmentId));
    
    if (!rawData) {
      throw new Error('Attachment not found');
    }
    
    // Transform single attachment with both field formats
    const transformedData = {
      AttachmentID: rawData.AttachmentID,
      attachmentId: rawData.AttachmentID,
      EntityID: rawData.EntityID,
      entityId: rawData.EntityID,
      EntityTypeID: rawData.EntityTypeID,
      entityTypeId: rawData.EntityTypeID,
      FileName: rawData.FileName,
      fileName: rawData.FileName,
      FileUrl: rawData.FileUrl,
      fileUrl: rawData.FileUrl,
      fileExtension: getFileExtension(rawData.FileName),
      UploadedAt: rawData.UploadedAt,
      uploadedAt: rawData.UploadedAt,
      formattedUploadDate: formatDate(rawData.UploadedAt),
      IsActive: rawData.IsActive,
      isActive: rawData.IsActive,
      fileType: classifyFileType(rawData.FileName),
      downloadUrl: `/attachments/${rawData.AttachmentID}/download`
    };
    
    return transformedData;
  } catch (error) {
    console.error("Error in getAttachmentById service:", error);
    throw error;
  }
}

// Update Attachment
async function updateAttachment(attachmentId, attachmentData) {
  try {
    const { entityId, entityTypeName, fileName, fileUrl } = attachmentData;
    
    const result = await attachmentRepo.updateAttachment(
      parseInt(attachmentId),
      parseInt(entityId),
      entityTypeName,
      fileName,
      fileUrl
    );
    
    return {
      success: true,
      message: result.message,
      attachmentId: parseInt(attachmentId)
    };
  } catch (error) {
    console.error("Error in updateAttachment service:", error);
    throw error;
  }
}

// Delete Attachment
async function deleteAttachment(attachmentId) {
  try {
    const attachment = await attachmentRepo.getAttachmentById(
      parseInt(attachmentId)
    );

    if (!attachment) {
      throw new Error("Attachment not found");
    }

    await attachmentRepo.deleteAttachment(parseInt(attachmentId));

    return {
      success: true,
      message: "Attachment deleted successfully",
      attachmentId: parseInt(attachmentId),
      fileUrl: attachment.FileUrl, // Return correct field name
    };
  } catch (error) {
    console.error("Error in deleteAttachment service:", error);
    throw error;
  }
}

// Deactivate Attachment
async function deactivateAttachment(attachmentId) {
  try {
    await attachmentRepo.deactivateAttachment(parseInt(attachmentId));
    
    return {
      success: true,
      message: 'Attachment deactivated successfully',
      attachmentId: parseInt(attachmentId)
    };
  } catch (error) {
    console.error("Error in deactivateAttachment service:", error);
    throw error;
  }
}

// Reactivate Attachment
async function reactivateAttachment(attachmentId) {
  try {
    await attachmentRepo.reactivateAttachment(parseInt(attachmentId));
    
    return {
      success: true,
      message: 'Attachment reactivated successfully',
      attachmentId: parseInt(attachmentId)
    };
  } catch (error) {
    console.error("Error in reactivateAttachment service:", error);
    throw error;
  }
}

// Helper function to classify file types for UI
function classifyFileType(fileName) {
  const extension = getFileExtension(fileName).toLowerCase();
  
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
  const documentTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
  const spreadsheetTypes = ['xls', 'xlsx', 'csv'];
  const archiveTypes = ['zip', 'rar', '7z', 'tar', 'gz'];
  const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
  const audioTypes = ['mp3', 'wav', 'flac', 'aac', 'ogg'];
  
  if (imageTypes.includes(extension)) return 'image';
  if (documentTypes.includes(extension)) return 'document';
  if (spreadsheetTypes.includes(extension)) return 'spreadsheet';
  if (archiveTypes.includes(extension)) return 'archive';
  if (videoTypes.includes(extension)) return 'video';
  if (audioTypes.includes(extension)) return 'audio';
  
  return 'other';
}

module.exports = {
  uploadAttachment,
  getAttachmentsForEntity,
  getAttachmentById,
  updateAttachment,
  deleteAttachment,
  deactivateAttachment,
  reactivateAttachment,
};