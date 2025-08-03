import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL_ALT;
const ACTIVITIES_API = `${BASE_URL}/activities`;

// ===========================
// Get all activities
// ===========================
export async function getAllActivities(onlyActive = true) {
  try {
    const response = await axios.get(ACTIVITIES_API, {
      params: { onlyActive }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching activities:", error);
    throw error;
  }
}


// ===========================
// Get activity by ID
// ===========================
export async function getActivityDetails(activityId) {
  try {
    const response = await axios.get(`${ACTIVITIES_API}/${activityId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching activity ${activityId}:`, error);
    throw error;
  }
}

// ===========================
// Create a new activity
// ===========================
export async function createActivity(activityData) {
  try {
    const response = await axios.post(ACTIVITIES_API, activityData);
    return response.data;
  } catch (error) {
    console.error("Error creating activity:", error);
    throw error;
  }
}

// ===========================
// Update activity
// ===========================
export async function updateActivity(activityId, activityData) {
  try {
    const response = await axios.put(`${ACTIVITIES_API}/${activityId}`, activityData);
    return response.data;
  } catch (error) {
    console.error(`Error updating activity ${activityId}:`, error);
    throw error;
  }
}

// ===========================
// Deactivate activity
// ===========================
export async function deactivateActivity(activityId) {
  try {
    const response = await axios.patch(`${ACTIVITIES_API}/${activityId}/deactivate`);
    return response.data;
  } catch (error) {
    console.error(`Error deactivating activity ${activityId}:`, error);
    throw error;
  }
}

// ===========================
// Reactivate activity
// ===========================
export async function reactivateActivity(activityId) {
  try {
    const response = await axios.patch(`${ACTIVITIES_API}/${activityId}/reactivate`);
    return response.data;
  } catch (error) {
    console.error(`Error reactivating activity ${activityId}:`, error);
    throw error;
  }
}

// ===========================
// Delete activity
// ===========================
export async function deleteActivity(activityId) {
  try {
    const response = await axios.delete(`${ACTIVITIES_API}/${activityId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting activity ${activityId}:`, error);
    throw error;
  }
}
