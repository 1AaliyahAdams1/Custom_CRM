import api from "../utils/api";

const RESOURCE = "/accounts";

export const getAllAccounts = async () => {
  try {
    const response = await api.get(RESOURCE);
    return response.data;
  } catch (error) {
    console.error("Error fetching all accounts:", error);
    throw error;
  }
};

export const fetchAccountById = async (id) => {
  if (id === undefined || id === null || id === "") {
    throw new Error(`Invalid Account ID provided: ${id}`);
  }

  try {
    const response = await api.get(`${RESOURCE}/${encodeURIComponent(id)}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching account ${id}:`, error?.response || error);
    throw error;
  }
};


export const createAccount = async (data) => {
  if (!data.AccountName) throw new Error("Account name is required");
  try {
    return await api.post(RESOURCE, data);
  } catch (error) {
    console.error("Error creating account:", error);
    throw error;
  }
};

export const updateAccount = async (id, data) => {
  if (!id) throw new Error("Account ID is required");
  if (!data.AccountName) throw new Error("Account name is required");
  try {
    return await api.put(`${RESOURCE}/${id}`, data);
  } catch (error) {
    console.error(`Error updating account ${id}:`, error);
    throw error;
  }
};

export const deactivateAccount = async (id) => {
  if (!id) throw new Error("Account ID is required");
  try {
    const response = await api.patch(`${RESOURCE}/${id}/deactivate`);
    return response.data;
  } catch (error) {
    console.error("Deactivate account error:", error);
    throw error;
  }
};

export const reactivateAccount = async (id) => {
  if (!id) throw new Error("Account ID is required");
  try {
    const response = await api.patch(`${RESOURCE}/${id}/reactivate`);
    return response.data;
  } catch (error) {
    console.error("Reactivate account error:", error);
    throw error;
  }
};

export const deleteAccount = async (id) => {
  if (!id) throw new Error("Account ID is required");
  try {
    return await api.delete(`${RESOURCE}/${id}/delete`);
  } catch (error) {
    console.error("Delete account error:", error);
    throw error;
  }
};

export async function fetchActiveAccountsByUser(userId) {
  if (!userId) throw new Error("User ID is required");
  try {
    const response = await api.get(`${RESOURCE}/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching active accounts by user:", error);
    throw error;
  }
}

export async function fetchActiveUnassignedAccounts() {
  try {
    const response = await api.get(`${RESOURCE}/unassigned`);
    return response.data;
  } catch (error) {
    console.error("Error fetching active unassigned accounts:", error);
    throw error;
  }
}