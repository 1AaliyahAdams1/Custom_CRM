import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL_ALT;
const RESOURCE = `${BASE_URL}/activities`;

// ===========================
// Get all activities
// ===========================
export async function getAllActivities() {
  const response = await axios.get(RESOURCE);
  return response.data;
}

// ===========================
// Get details of a specific activity (with notes, attachments, and contacts)
// ===========================
export async function getActivityDetails(activityId) {
  const response = await axios.get(`${RESOURCE}/${activityId}`);
  return response.data;
}

// ===========================
// Create a new activity
// ===========================
export async function createActivity(activityData) {
  const response = await axios.post(RESOURCE, activityData);
  return response.data;
}

// ===========================
// Update an existing activity
// ===========================
export async function updateActivity(activityId, activityData) {
  const response = await axios.put(`${RESOURCE}/${activityId}`, activityData);
  return response.data;
}

// ===========================
// Delete an activity
// ===========================
export async function deleteActivity(activityId) {
  const response = await axios.delete(`${RESOURCE}/${activityId}`);
  return response.data;
}
