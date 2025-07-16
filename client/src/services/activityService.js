// SERVICE : Activity Service
// Service module for handling all API calls related to activities

//IMPORTS
import axios from "axios";

// Set base URLs from environment
const baseApiUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL_ALT;

// Full endpoint URL for activities
const DB_URL = `${baseApiUrl}/activity`;

// Fetch all activities from the server
export const getActivities = async () => {
  try {
    const response = await axios.get(DB_URL);
    return response.data;  // Return list of activities
  } catch (error) {
    // Throw error with message from server or default message
    throw new Error(error.response?.data?.error || "Failed to fetch activities");
  }
};

// Create a new activity with the given data
export const createActivity = async (activity) => {
  try {
    const response = await axios.post(DB_URL, activity);
    return response.data;  // Return newly created activity
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to create activity");
  }
};

// Update an existing activity by ID
export const updateActivity = async (id, activity) => {
  try {
    const response = await axios.put(`${DB_URL}/${id}`, activity);
    return response.data;  // Return updated activity
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to update activity");
  }
};

// Delete an activity by ID
export const deleteActivity = async (id) => {
  try {
    const response = await axios.delete(`${DB_URL}/${id}`);
    return response.data;  // Return deletion confirmation
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to delete activity");
  }
};

// Get detailed information of a single activity by ID
export const getActivityDetails = async (id) => {
  try {
    const response = await axios.get(`${DB_URL}/${id}`);
    return response.data;  // Return activity details
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to fetch activity details");
  }
};
