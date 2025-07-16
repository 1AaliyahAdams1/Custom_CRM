// SERVICE : Deal Service
// Service module for handling all API calls related to Deals

//IMPORTS
import axios from "axios";

// Set base URLs from environment
const baseApiUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL_ALT;

// Full endpoint URL for deal-related API requests
const DB_URL = `${baseApiUrl}/deal`;

// Fetch all deals from the backend
export const getDeals = async () => {
  try {
    const response = await axios.get(DB_URL);
    // Return array of deals
    return response.data;
  } catch (error) {
    // Throw error with backend message or fallback message
    throw new Error(error.response?.data?.error || "Failed to fetch deals");
  }
};

// Create a new deal by sending deal data to the backend
export const createDeal = async (deal) => {
  try {
    const response = await axios.post(DB_URL, deal);
    // Return the created deal data
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to create deal");
  }
};

// Update an existing deal identified by ID with new data
export const updateDeal = async (id, deal) => {
  try {
    const response = await axios.put(`${DB_URL}/${id}`, deal);
    // Return updated deal data
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to update deal");
  }
};

// Delete a deal by ID
export const deleteDeal = async (id) => {
  try {
    const response = await axios.delete(`${DB_URL}/${id}`);
    // Return confirmation of deletion
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to delete deal");
  }
};

// Fetch details of a single deal by ID
export const getDealDetails = async (id) => {
  try {
    const response = await axios.get(`${DB_URL}/${id}`);
    // Return detailed deal data
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to fetch deal details");
  }
};
