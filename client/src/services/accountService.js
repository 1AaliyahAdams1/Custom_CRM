import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL_ALT;
const RESOURCE = `${BASE_URL}/accounts`;

// Configure axios defaults
axios.defaults.timeout = 10000; // 10 second timeout

// Get all accounts
export const getAllAccounts = async () => {
  try {
    return await axios.get(RESOURCE);
  } catch (error) {
    console.error("Error fetching all accounts:", error);
    throw error;
  }
};

// Get account by ID
export const fetchAccountById = async (id) => {
  try {
    if (!id) throw new Error("Account ID is required");
    return await axios.get(`${RESOURCE}/${id}`);
  } catch (error) {
    console.error(`Error fetching account ${id}:`, error);
    throw error;
  }
};

// Create new account
export const createAccount = async (data) => {
  try {
    if (!data.AccountName) throw new Error("Account name is required");
    return await axios.post(RESOURCE, data);
  } catch (error) {
    console.error("Error creating account:", error);
    throw error;
  }
};

// Update account
export const updateAccount = async (id, data) => {
  try {
    if (!id) throw new Error("Account ID is required");
    if (!data.AccountName) throw new Error("Account name is required");
    return await axios.put(`${RESOURCE}/${id}`, data);
  } catch (error) {
    console.error(`Error updating account ${id}:`, error);
    throw error;
  }
};

// Deactivate account (soft delete)
export const deactivateAccount = async (id) => {
  try {
    if (!id) throw new Error("Account ID is required");
    const response = await axios.patch(`${RESOURCE}/${id}/deactivate`);
    return response.data;
  } catch (error) {
    console.error("Deactivate account error:", error);
    throw error;
  }
};

// Reactivate account
export const reactivateAccount = async (id) => {
  try {
    if (!id) throw new Error("Account ID is required");
    return await axios.patch(`${RESOURCE}/${id}/reactivate`);
  } catch (error) {
    console.error("Reactivate account error:", error);
    throw error;
  }
};

// Hard delete account - Fixed endpoint
export const deleteAccount = async (id) => {
  try {
    if (!id) throw new Error("Account ID is required");
    return await axios.delete(`${RESOURCE}/${id}/delete`);
  } catch (error) {
    console.error("Delete account error:", error);
    throw error;
  }
};