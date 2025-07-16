// SERVICE : Account Service
// Service module for handling all API calls related to accounts

//IMPORTS
import axios from "axios";

// Set base URLs from environment
const baseApiUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL_ALT;

// Base endpoint for account-related API calls
const DB_URL = `${baseApiUrl}/account`;

// Fetch all accounts from the backend
export const getAccounts = async () => {
  try {
    const response = await axios.get(DB_URL);  // GET request to /account
    return response.data;                      // Return array of accounts
  } catch (error) {
    // Throw error with backend message if available, else default message
    throw new Error(error.response?.data?.error || "Failed to fetch accounts");
  }
};

// Fetch details of a single account by ID
export const getAccountDetails = async (id) => {
  try {
    const response = await axios.get(`${DB_URL}/${id}`);  // GET /account/:id
    return response.data;                                 // Return account object
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to fetch account details");
  }
};

// Create a new account by sending POST with account data
export const createAccount = async (account) => {
  try {
    const response = await axios.post(DB_URL, account);  // POST /account with payload
    return response.data;                                // Return created account
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to create account");
  }
};

// Update an existing account by ID with new data
export const updateAccount = async (id, account) => {
  try {
    const response = await axios.put(`${DB_URL}/${id}`, account);  // PUT /account/:id
    return response.data;                                         // Return updated account
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to update account");
  }
};

// Delete an account by ID
export const deleteAccount = async (id) => {
  try {
    const response = await axios.delete(`${DB_URL}/${id}`);  // DELETE /account/:id
    return response.data;                                    // Return any confirmation
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to delete account");
  }
};
