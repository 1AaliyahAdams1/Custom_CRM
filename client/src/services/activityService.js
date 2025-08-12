import api from "../utils/api";

const RESOURCE = "/activities";

export const getAllActivities = async (onlyActive = true) => {
  try {
    const response = await api.get(RESOURCE, { params: { onlyActive } });
    return response.data;
  } catch (error) {
    console.error("Error fetching activities:", error);
    throw error;
  }
};

export const fetchActivityById = async (activityId) => {
  try {
    return await api.get(`${RESOURCE}/${activityId}`);
  } catch (error) {
    console.error(`Error fetching activity ${activityId}:`, error);
    throw error;
  }
};

export const createActivity = async (activityData) => {
  try {
    return await api.post(RESOURCE, activityData);
  } catch (error) {
    console.error("Error creating activity:", error);
    throw error;
  }
};

export const updateActivity = async (activityId, activityData) => {
  try {
    return await api.put(`${RESOURCE}/${activityId}`, activityData);
  } catch (error) {
    console.error(`Error updating activity ${activityId}:`, error);
    throw error;
  }
};

export const deactivateActivity = async (activityId) => {
  try {
    const response = await api.patch(`${RESOURCE}/${activityId}/deactivate`);
    return response.data;
  } catch (error) {
    console.error(`Error deactivating activity ${activityId}:`, error);
    throw error;
  }
};

export const reactivateActivity = async (activityId) => {
  try {
    const response = await api.patch(`${RESOURCE}/${activityId}/reactivate`);
    return response.data;
  } catch (error) {
    console.error(`Error reactivating activity ${activityId}:`, error);
    throw error;
  }
};

export const deleteActivity = async (activityId) => {
  try {
    const response = await api.delete(`${RESOURCE}/${activityId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting activity ${activityId}:`, error);
    throw error;
  }
};

export async function fetchActivitiesByUser(userId) {
  const response = await axios.get(`${API_BASE}/activities/user/${userId}`);
  return response.data;
}