import api from "../utils/api";

const RESOURCE = "/attachments";

export const uploadAttachment = async ({ file, entityId, entityTypeName, userName }) => {
  if (!file) throw new Error("File is required");
  if (!entityId) throw new Error("Entity ID is required");
  if (!entityTypeName) throw new Error("Entity type is required");

  const maxSize = 10 * 1024 * 1024;
  const allowedTypes = [
    "image/jpeg","image/jpg","image/png","image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "application/zip",
    "application/x-rar-compressed",
    "video/mp4",
    "audio/mpeg"
  ];

  if (file.size > maxSize) throw new Error("File size exceeds 10MB limit");
  if (!allowedTypes.includes(file.type)) throw new Error("File type not allowed");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("entityId", entityId);
  formData.append("entityTypeName", entityTypeName);
  
  // Add createdBy parameter - this was missing!
  if (userName) {
    formData.append("createdBy", userName);
  }

  try {
    return await api.post(`${RESOURCE}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } catch (error) {
    console.error("Error uploading attachment:", error?.response || error);
    throw error;
  }
};

export const uploadMultipleAttachments = async (attachments) => {
  if (!attachments?.length) throw new Error("Attachments array is required");
  const results = [];
  for (const att of attachments) {
    const result = await uploadAttachment({
      file: att.file,
      entityId: att.EntityID,
      entityTypeName: att.EntityType,
      userName: att.userName, // Pass userName for multiple uploads too
    });
    results.push(result);
  }
  return results;
};

export const getAttachmentsByEntity = async (entityId, entityTypeName) => {
  if (!entityId) throw new Error("Entity ID is required");
  if (!entityTypeName) throw new Error("Entity type is required");

  try {
    const response = await api.get(`${RESOURCE}/entity/${entityId}/${entityTypeName}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching attachments:", error?.response || error);
    throw error;
  }
};

export const getAttachmentById = async (attachmentId) => {
  if (!attachmentId) throw new Error("Attachment ID is required");

  try {
    const response = await api.get(`${RESOURCE}/${attachmentId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching attachment:", error?.response || error);
    throw error;
  }
};

export const updateAttachment = async (attachmentId, updateData) => {
  if (!attachmentId) throw new Error("Attachment ID is required");
  
  try {
    return await api.put(`${RESOURCE}/${attachmentId}`, updateData);
  } catch (error) {
    console.error("Error updating attachment:", error?.response || error);
    throw error;
  }
};

export const deleteAttachment = async (attachmentId) => {
  if (!attachmentId) throw new Error("Attachment ID is required");
  try {
    return await api.delete(`${RESOURCE}/${attachmentId}`);
  } catch (error) {
    console.error("Error deleting attachment:", error?.response || error);
    throw error;
  }
};

export const deactivateAttachment = async (attachmentId) => {
  if (!attachmentId) throw new Error("Attachment ID is required");
  
  try {
    return await api.patch(`${RESOURCE}/${attachmentId}/deactivate`);
  } catch (error) {
    console.error("Error deactivating attachment:", error?.response || error);
    throw error;
  }
};

export const reactivateAttachment = async (attachmentId) => {
  if (!attachmentId) throw new Error("Attachment ID is required");
  
  try {
    return await api.patch(`${RESOURCE}/${attachmentId}/reactivate`);
  } catch (error) {
    console.error("Error reactivating attachment:", error?.response || error);
    throw error;
  }
};

export const getAllAttachments = async () => {
  try {
    const response = await api.get(`${RESOURCE}/all`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all attachments:", error?.response || error);
    throw error;
  }
};

export const downloadAttachment = async (attachment) => {
  if (!attachment) throw new Error("Attachment is required");
  const attachmentId = attachment.AttachmentID || attachment.attachmentId;

  try {
    const response = await api.get(`${RESOURCE}/${attachmentId}/download`, { responseType: "blob" });

    const contentDisposition = response.headers["content-disposition"];
    // Extract filename from FileUrl since FileName isn't stored
    let filename = "download";
    
    if (attachment.FileUrl || attachment.fileUrl) {
      const fileUrl = attachment.FileUrl || attachment.fileUrl;
      filename = fileUrl.split('/').pop() || filename;
    }

    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?(.+)"?/);
      if (match) filename = match[1];
    }

    const url = window.URL.createObjectURL(response.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    return { message: "Download completed" };
  } catch (error) {
    console.error("Error downloading attachment:", error?.response || error);
    throw error;
  }
};

export const getFileIcon = (fileUrl) => {
  if (!fileUrl) return "📎";
  
  const fileName = fileUrl.split('/').pop() || "";
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  
  const map = {
    pdf: "📄",
    doc: "📝", docx: "📝",
    xls: "📊", xlsx: "📊",
    txt: "📄",
    jpg: "🖼️", jpeg: "🖼️", png: "🖼️", gif: "🖼️",
    zip: "🗜️", rar: "🗜️",
    mp4: "🎥", avi: "🎥",
    mp3: "🎵", wav: "🎵",
  };
  return map[ext] || "📎";
};