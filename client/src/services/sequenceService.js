import api from "../utils/api";

const RESOURCE = "/sequences";

// ======================================
// SEQUENCE CRUD
// ======================================
export const getAllSequences = async (onlyActive = true) => {
  try {
    const response = await api.get(RESOURCE, { params: { onlyActive } });
    return response.data;
  } catch (error) {
    console.error("Error fetching sequences:", error);
    throw error;
  }
};

export const fetchSequenceById = async (sequenceId) => {
  try {
    const response = await api.get(`${RESOURCE}/${sequenceId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching sequence ${sequenceId}:`, error);
    throw error;
  }
};

export const fetchSequenceWithItems = async (sequenceId) => {
  try {
    const response = await api.get(`${RESOURCE}/${sequenceId}/items`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching sequence with items ${sequenceId}:`, error);
    throw error;
  }
};

export const createSequence = async (sequenceData) => {
  try {
    return await api.post(RESOURCE, sequenceData);
  } catch (error) {
    console.error("Error creating sequence:", error);
    throw error;
  }
};

export const updateSequence = async (sequenceId, sequenceData) => {
  try {
    return await api.put(`${RESOURCE}/${sequenceId}`, sequenceData);
  } catch (error) {
    console.error(`Error updating sequence ${sequenceId}:`, error);
    throw error;
  }
};

export const deactivateSequence = async (sequenceId) => {
  try {
    const response = await api.patch(`${RESOURCE}/${sequenceId}/deactivate`);
    return response.data;
  } catch (error) {
    console.error(`Error deactivating sequence ${sequenceId}:`, error);
    throw error;
  }
};

export const reactivateSequence = async (sequenceId) => {
  try {
    const response = await api.patch(`${RESOURCE}/${sequenceId}/reactivate`);
    return response.data;
  } catch (error) {
    console.error(`Error reactivating sequence ${sequenceId}:`, error);
    throw error;
  }
};

export const deleteSequence = async (sequenceId) => {
  try {
    const response = await api.delete(`${RESOURCE}/${sequenceId}/delete`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting sequence ${sequenceId}:`, error);
    throw error;
  }
};

// ======================================
// SEQUENCE ITEMS CRUD
// ======================================
export const getAllSequenceItems = async () => {
  try {
    // Now using the efficient endpoint that returns ALL items with SequenceID
    const response = await api.get(`${RESOURCE}/items`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all sequence items:", error);
    throw error;
  }
};

export const fetchSequenceItemById = async (itemId) => {
  try {
    const response = await api.get(`${RESOURCE}/items/${itemId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching sequence item ${itemId}:`, error);
    throw error;
  }
};

export const createSequenceItem = async (itemData) => {
  try {
    return await api.post(`${RESOURCE}/items`, itemData);
  } catch (error) {
    console.error("Error creating sequence item:", error);
    throw error;
  }
};

export const updateSequenceItem = async (itemId, itemData) => {
  try {
    return await api.put(`${RESOURCE}/items/${itemId}`, itemData);
  } catch (error) {
    console.error(`Error updating sequence item ${itemId}:`, error);
    throw error;
  }
};

export const deleteSequenceItem = async (itemId) => {
  try {
    const response = await api.delete(`${RESOURCE}/items/${itemId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting sequence item ${itemId}:`, error);
    throw error;
  }
};

export const getAllActivityTypes = async () => {
  try {
    const response = await api.get(`${RESOURCE}/activity-types`);
    return response.data;
  } catch (error) {
    console.error("Error fetching activity types:", error);
    throw error;
  }
};

// ======================================
// BULK OPERATIONS
// ======================================
export const bulkDeactivateSequences = async (sequenceIds) => {
  if (!Array.isArray(sequenceIds) || sequenceIds.length === 0) {
    throw new Error("Sequence IDs array is required");
  }
  
  try {
    const response = await api.patch(`${RESOURCE}/bulk/deactivate`, {
      sequenceIds: sequenceIds
    });
    return response.data;
  } catch (error) {
    console.error("Error deactivating sequences:", error);
    throw error;
  }
};

export const bulkReactivateSequences = async (sequenceIds) => {
  if (!Array.isArray(sequenceIds) || sequenceIds.length === 0) {
    throw new Error("Sequence IDs array is required");
  }
  
  try {
    const response = await api.patch(`${RESOURCE}/bulk/reactivate`, {
      sequenceIds: sequenceIds
    });
    return response.data;
  } catch (error) {
    console.error("Error reactivating sequences:", error);
    throw error;
  }
};

export const bulkDeleteSequences = async (sequenceIds) => {
  if (!Array.isArray(sequenceIds) || sequenceIds.length === 0) {
    throw new Error("Sequence IDs array is required");
  }
  
  try {
    const response = await api.delete(`${RESOURCE}/bulk`, {
      data: { sequenceIds: sequenceIds }
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting sequences:", error);
    throw error;
  }
};