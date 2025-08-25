const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const attachmentService = {
  // Upload single attachment (fixed to match backend)
  async uploadAttachment(attachmentData) {
    try {
      const { file, entityId, entityTypeName } = attachmentData;
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entityId', entityId);
      formData.append('entityTypeName', entityTypeName);
      
      // Fixed URL - removed /api prefix to match your backend routes
      const response = await fetch(`${API_BASE_URL}/attachments/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload attachment');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw error;
    }
  },

  // Upload multiple attachments (fixed to work with single upload endpoint)
  async uploadMultipleAttachments(attachmentDataArray) {
    try {
      const results = [];
      
      // Upload files one by one since your backend handles single files
      for (const attachmentData of attachmentDataArray) {
        const result = await this.uploadAttachment({
          file: attachmentData.file,
          entityId: attachmentData.EntityID,
          entityTypeName: attachmentData.EntityType
        });
        results.push(result);
      }
      
      return results;
    } catch (error) {
      console.error('Error uploading multiple attachments:', error);
      throw error;
    }
  },

  // Get attachments for entity (fixed URL)
  async getAttachmentsByEntity(entityId, entityTypeName) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/attachments/entity/${entityId}/${entityTypeName}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch attachments');
      }
      
      const result = await response.json();
      
      // The backend returns the transformed data with summary
      return result.data || result; // Handle both formats
    } catch (error) {
      console.error('Error fetching attachments:', error);
      throw error;
    }
  },

  // Delete attachment (fixed URL)
  async deleteAttachment(attachmentId) {
    try {
      const response = await fetch(`${API_BASE_URL}/attachments/${attachmentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete attachment');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting attachment:', error);
      throw error;
    }
  },

  // Download attachment (fixed to work with your backend structure)
  async downloadAttachment(attachment) {
    try {
      const attachmentId = attachment.AttachmentID || attachment.attachmentId;
      
      const response = await fetch(
        `${API_BASE_URL}/attachments/${attachmentId}/download`,
        {
          method: 'GET',
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to download attachment');
      }

      // Get the filename from the response headers or use attachment data
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = attachment.FileName || attachment.fileName || 'download';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'Download completed' };
    } catch (error) {
      console.error('Error downloading attachment:', error);
      throw error;
    }
  },

  // Get attachment by ID (fixed URL)
  async getAttachmentById(attachmentId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/attachments/${attachmentId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch attachment');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching attachment by ID:', error);
      throw error;
    }
  },

  // Validate file before upload
  validateFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/zip',
      'application/x-rar-compressed',
      'video/mp4',
      'audio/mpeg'
    ];

    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error('File type not allowed');
    }

    return true;
  },

  // Get file icon based on type (for UI)
  getFileIcon(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    
    const iconMap = {
      pdf: '📄',
      doc: '📝', docx: '📝',
      xls: '📊', xlsx: '📊',
      txt: '📄',
      jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️',
      zip: '🗜️', rar: '🗜️',
      mp4: '🎥', avi: '🎥',
      mp3: '🎵', wav: '🎵'
    };
    
    return iconMap[extension] || '📎';
  }
};