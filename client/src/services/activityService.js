// Client/services/activityService.js
import api from "../utils/api";

const RESOURCE = "/activities";

/**
 * Centralized error handler
 */
const handleError = (context, error) => {
  console.error(`${context}:`, error?.response?.data || error.message || error);
  throw error;
};

/**
 * Validate activity data before API calls
 */
const validateActivityData = (activityData) => {
  if (!activityData) throw new Error("Activity data is required");

  const { activity_name, type, date } = activityData;

  if (!activity_name?.trim()) throw new Error("Activity name is required");
  if (!type?.trim()) throw new Error("Activity type is required");
  if (!date) throw new Error("Activity date is required");
};

// ----------------------------------------------------------------------
// API Methods
// ----------------------------------------------------------------------

export const getAllActivities = async (onlyActive = true) => {
  try {
    const response = await api.get(RESOURCE, { params: { onlyActive } });
    return response?.data || [];
  } catch (error) {
    handleError("Error fetching activities", error);
  }
};

export const fetchActivityById = async (activityId) => {
  if (!activityId) throw new Error("Activity ID is required");

  try {
    const response = await api.get(
      `${RESOURCE}/${encodeURIComponent(activityId)}`
    );
    return response?.data;
  } catch (error) {
    handleError(`Error fetching activity ${activityId}`, error);
  }
};

export const createActivity = async (activityData) => {
  try {
    validateActivityData(activityData);
    const response = await api.post(RESOURCE, activityData);
    return response?.data;
  } catch (error) {
    handleError("Error creating activity", error);
  }
};

export const updateActivity = async (activityId, activityData) => {
  if (!activityId) throw new Error("Activity ID is required");

  try {
    validateActivityData(activityData);
    const response = await api.put(
      `${RESOURCE}/${encodeURIComponent(activityId)}`,
      activityData
    );
    return response?.data;
  } catch (error) {
    handleError(`Error updating activity ${activityId}`, error);
  }
};

export const deactivateActivity = async (activityId) => {
  if (!activityId) throw new Error("Activity ID is required");

  try {
    const response = await api.patch(
      `${RESOURCE}/${encodeURIComponent(activityId)}/deactivate`
    );
    return response?.data;
  } catch (error) {
    handleError(`Error deactivating activity ${activityId}`, error);
  }
};

export const reactivateActivity = async (activityId) => {
  if (!activityId) throw new Error("Activity ID is required");

  try {
    const response = await api.patch(
      `${RESOURCE}/${encodeURIComponent(activityId)}/reactivate`
    );
    return response?.data;
  } catch (error) {
    handleError(`Error reactivating activity ${activityId}`, error);
  }
};

export const deleteActivity = async (activityId) => {
  if (!activityId) throw new Error("Activity ID is required");

  try {
    const response = await api.delete(
      `${RESOURCE}/${encodeURIComponent(activityId)}/delete`
    );
    return response?.data;
  } catch (error) {
    handleError(`Error deleting activity ${activityId}`, error);
  }
};

export const fetchActivitiesByUser = async (userId) => {
  if (!userId) throw new Error("User ID is required");

  try {
    const response = await api.get(
      `${RESOURCE}/user/${encodeURIComponent(userId)}`
    );
    return response?.data || [];
  } catch (error) {
    handleError(`Error fetching activities for user ${userId}`, error);
  }
};

export const searchActivities = async (searchTerm, onlyActive = true) => {
  if (!searchTerm?.trim()) throw new Error("Search term is required");

  try {
    const response = await api.get(`${RESOURCE}/search`, {
      params: { q: searchTerm, onlyActive },
    });
    return response?.data || [];
  } catch (error) {
    handleError(`Error searching activities with term "${searchTerm}"`, error);
  }
};

export const getActivitiesWithPagination = async (
  page = 1,
  pageSize = 10,
  onlyActive = true
) => {
  try {
    const response = await api.get(`${RESOURCE}/paginated`, {
      params: { page, pageSize, onlyActive },
    });
    return response?.data || { items: [], total: 0 };
  } catch (error) {
    handleError(`Error fetching activities page ${page}`, error);
  }
};

// Default export (optional - backward compatibility)
export default {
  getAllActivities,
  fetchActivityById,
  createActivity,
  updateActivity,
  deactivateActivity,
  reactivateActivity,
  deleteActivity,
  fetchActivitiesByUser,
  searchActivities,
  getActivitiesWithPagination,
};
