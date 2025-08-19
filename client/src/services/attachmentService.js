// ==========================================
// 2. ATTACHMENTS SERVICE
// ==========================================


export const attachmentService = {
  async uploadAttachment(attachmentData) {
    try {
      const formData = new FormData();
      
      // Add files to FormData
      attachmentData.files.forEach((file, index) => {
        formData.append(`files`, file);
      });
      
      // Add metadata
      formData.append('entityType', attachmentData.entityType);
      formData.append('entityId', attachmentData.entityId);
      formData.append('description', attachmentData.description || '');
      
      const response = await fetch('/api/attachments', {
        method: 'POST',
        body: formData, // Don't set Content-Type header, let browser set it with boundary
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload attachments');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error uploading attachments:', error);
      throw error;
    }
  },

  async deleteAttachment(attachmentId) {
    try {
      const response = await fetch(`/api/attachments/${attachmentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete attachment');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting attachment:', error);
      throw error;
    }
  },

  async getAttachmentsByEntity(entityType, entityId) {
    try {
      const response = await fetch(`/api/attachments?entityType=${entityType}&entityId=${entityId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch attachments');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching attachments:', error);
      throw error;
    }
  },

  async downloadAttachment(attachmentId) {
    try {
      const response = await fetch(`/api/attachments/${attachmentId}/download`);
      
      if (!response.ok) {
        throw new Error('Failed to download attachment');
      }
      
      // Return blob for file download
      return await response.blob();
    } catch (error) {
      console.error('Error downloading attachment:', error);
      throw error;
    }
  }
};