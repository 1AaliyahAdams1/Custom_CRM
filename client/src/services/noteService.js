import api from "../utils/api";

const RESOURCE = "/notes";

export const createNote = async (noteData) => {
  if (!noteData?.EntityID) throw new Error("EntityID is required");
  if (!noteData?.EntityType) throw new Error("EntityType is required");
  if (!noteData?.Content) throw new Error("Note content is required");

  try {
    return await api.post(RESOURCE, {
      EntityID: noteData.EntityID,
      EntityTypeName: noteData.EntityType,
      Content: noteData.Content,
    });
  } catch (error) {
    console.error("Error creating note:", error?.response || error);
    throw error;
  }
};

export const updateNote = async (noteId, noteData) => {
  if (!noteId) throw new Error("Note ID is required");
  if (!noteData?.EntityID || !noteData?.EntityType || !noteData?.Content) {
    throw new Error("EntityID, EntityType, and Content are required to update a note");
  }

  try {
    return await api.put(`${RESOURCE}/${noteId}`, {
      EntityID: noteData.EntityID,
      EntityTypeName: noteData.EntityType,
      Content: noteData.Content,
    });
  } catch (error) {
    console.error(`Error updating note ${noteId}:`, error?.response || error);
    throw error;
  }
};

export const deleteNote = async (noteId) => {
  if (!noteId) throw new Error("Note ID is required");
  try {
    return await api.delete(`${RESOURCE}/${noteId}`);
  } catch (error) {
    console.error(`Error deleting note ${noteId}:`, error?.response || error);
    throw error;
  }
};

export const deactivateNote = async (noteId) => {
  if (!noteId) throw new Error("Note ID is required");
  try {
    return await api.patch(`${RESOURCE}/${noteId}/deactivate`);
  } catch (error) {
    console.error(`Error deactivating note ${noteId}:`, error?.response || error);
    throw error;
  }
};

export const reactivateNote = async (noteId) => {
  if (!noteId) throw new Error("Note ID is required");
  try {
    return await api.patch(`${RESOURCE}/${noteId}/reactivate`);
  } catch (error) {
    console.error(`Error reactivating note ${noteId}:`, error?.response || error);
    throw error;
  }
};

export const getNotesByEntity = async (entityType, entityId) => {
  if (!entityType) throw new Error("EntityType is required");
  if (!entityId) throw new Error("EntityID is required");

  try {
    const response = await api.get(RESOURCE, {
      params: { entityId, entityTypeName: entityType },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching notes for ${entityType} ${entityId}:`, error?.response || error);
    throw error;
  }
};

export const getNotesByAccountID = async (accountId) => {
  if (!accountId) throw new Error("Account ID is required");
  try {
    const response = await api.get(`${RESOURCE}/account/${accountId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching notes for account ${accountId}:`, error?.response || error);
    throw error;
  }
};