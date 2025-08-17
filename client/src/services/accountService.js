// Client/services/accountService.js
import api from "../utils/api";

const RESOURCE = "/accounts";

const handleError = (context, error) => {
  console.error(`${context}:`, error?.response?.data || error.message || error);
  throw error;
};

// 🔹 Get all accounts
export const getAllAccounts = async (onlyActive = true) => {
  try {
    const response = await api.get(RESOURCE, { params: { onlyActive } });
    return response.data;
  } catch (error) {
    handleError("Error fetching accounts", error);
  }
};

// 🔹 Get account by ID
export const fetchAccountById = async (accountId) => {
  if (!accountId) throw new Error("Account ID is required");

  try {
    const response = await api.get(`${RESOURCE}/${accountId}`);
    return response.data;
  } catch (error) {
    handleError(`Error fetching account ${accountId}`, error);
  }
};

// 🔹 Create new account
export const createAccount = async (accountData) => {
  if (!accountData) throw new Error("Account data is required");

  try {
    const response = await api.post(RESOURCE, accountData);
    return response.data;
  } catch (error) {
    handleError("Error creating account", error);
  }
};

// 🔹 Update account
export const updateAccount = async (accountId, accountData) => {
  if (!accountId) throw new Error("Account ID is required");
  if (!accountData) throw new Error("Account data is required");

  try {
    const response = await api.put(`${RESOURCE}/${accountId}`, accountData);
    return response.data;
  } catch (error) {
    handleError(`Error updating account ${accountId}`, error);
  }
};

// 🔹 Deactivate account
export const deactivateAccount = async (accountId) => {
  if (!accountId) throw new Error("Account ID is required");

  try {
    const response = await api.patch(`${RESOURCE}/${accountId}/deactivate`);
    return response.data;
  } catch (error) {
    handleError(`Error deactivating account ${accountId}`, error);
  }
};

// 🔹 Reactivate account
export const reactivateAccount = async (accountId) => {
  if (!accountId) throw new Error("Account ID is required");

  try {
    const response = await api.patch(`${RESOURCE}/${accountId}/reactivate`);
    return response.data;
  } catch (error) {
    handleError(`Error reactivating account ${accountId}`, error);
  }
};

// 🔹 Delete account
export const deleteAccount = async (accountId) => {
  if (!accountId) throw new Error("Account ID is required");

  try {
    const response = await api.delete(`${RESOURCE}/${accountId}/delete`);
    return response.data;
  } catch (error) {
    handleError(`Error deleting account ${accountId}`, error);
  }
};

// 🔹 Accounts by user
export const fetchActiveAccountsByUser = async (userId) => {
  if (!userId) throw new Error("User ID is required");

  try {
    const response = await api.get(`${RESOURCE}/user/${userId}`);
    return response.data;
  } catch (error) {
    handleError(`Error fetching accounts for user ${userId}`, error);
  }
};

// 🔹 Unassigned active accounts
export const fetchActiveUnassignedAccounts = async () => {
  try {
    const response = await api.get(`${RESOURCE}/unassigned/active`);
    return response.data;
  } catch (error) {
    handleError("Error fetching unassigned active accounts", error);
  }
};

// 🔹 Default export (backward compatibility)
export default {
  getAllAccounts,
  fetchAccountById,
  createAccount,
  updateAccount,
  deactivateAccount,
  reactivateAccount,
  deleteAccount,
  fetchActiveAccountsByUser,
  fetchActiveUnassignedAccounts,
};
