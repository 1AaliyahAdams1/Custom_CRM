// ==========================================
// NOTES SERVICE - Frontend
// ==========================================

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export const noteService = {
  // Create a new note
  async createNote(noteData) {
    try {
      const response = await fetch(`${API_BASE_URL}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          EntityID: noteData.EntityID,
          EntityTypeName: noteData.EntityType,
          Content: noteData.Content,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create note');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  },

  // Update an existing note
  async updateNote(noteId, noteData) {
    try {
      const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          EntityID: noteData.EntityID,
          EntityTypeName: noteData.EntityType,
          Content: noteData.Content,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update note');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  },

  // Delete a note (hard delete)
  async deleteNote(noteId) {
    try {
      const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete note');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  },

  // Deactivate a note (soft delete)
  async deactivateNote(noteId) {
    try {
      const response = await fetch(`${API_BASE_URL}/notes/${noteId}/deactivate`, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to deactivate note');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deactivating note:', error);
      throw error;
    }
  },

  // Reactivate a note
  async reactivateNote(noteId) {
    try {
      const response = await fetch(`${API_BASE_URL}/notes/${noteId}/reactivate`, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reactivate note');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error reactivating note:', error);
      throw error;
    }
  },

  // Get notes for a specific entity
  async getNotesByEntity(entityType, entityId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notes?entityId=${entityId}&entityTypeName=${entityType}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch notes');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  }
};