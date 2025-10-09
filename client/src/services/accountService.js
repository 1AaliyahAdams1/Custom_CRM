import api from "../utils/api";

const RESOURCE = "/accounts";

// Helper to get current user ID from localStorage
const getCurrentUserId = () => {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  return user.UserID || user.id || user.userId;
};

export const getAllAccounts = async () => {
  try {
    const response = await api.get('/accounts');
    return response.data;
  } catch (error) {
    console.error('Error fetching all accounts:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
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

// Check if accounts are claimable
export async function checkAccountsClaimability(accountIds) {
  if (!Array.isArray(accountIds) || accountIds.length === 0) {
    throw new Error("Account IDs array is required");
  }
  
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error("User not logged in");
  }
  
  try {
    const response = await api.post(`${RESOURCE}/check-claimability`, { 
      accountIds,
      userId 
    });
    return response.data;
  } catch (error) {
    console.error("Error checking account claimability:", error);
    throw error;
  }
}

// Bulk claim accounts
export async function bulkClaimAccounts(accountIds) {
  if (!Array.isArray(accountIds) || accountIds.length === 0) {
    throw new Error("Account IDs array is required");
  }
  
  // Get userId from localStorage
  const userId = getCurrentUserId();
  
  if (!userId) {
    throw new Error("User not logged in. Please log in and try again.");
  }
  
  try {
    const response = await api.post(`${RESOURCE}/bulk-claim`, { 
      accountIds,
      userId  // 
    });
    return response.data;
  } catch (error) {
    console.error("Error bulk claiming accounts:", error);
    throw error;
  }
}

// Get all sequences for dropdown
export async function getAllSequences() {
  try {
    const response = await api.get('/sequences');
    return response.data;
  } catch (error) {
    console.error("Error fetching sequences:", error);
    throw error;
  }
}

// Bulk claim and add sequence
export async function bulkClaimAccountsAndAddSequence(accountIds, sequenceId) {
  if (!Array.isArray(accountIds) || accountIds.length === 0) {
    throw new Error("Account IDs array is required");
  }
  
  if (!sequenceId) {
    throw new Error("Sequence ID is required");
  }
  
  const userId = getCurrentUserId();
  
  if (!userId) {
    throw new Error("User not logged in. Please log in and try again.");
  }
  
  try {
    const response = await api.post(`${RESOURCE}/bulk-claim-and-sequence`, { 
      accountIds,
      sequenceId,
      userId
    });
    return response.data;
  } catch (error) {
    console.error("Error bulk claiming accounts and adding sequence:", error);
    throw error;
  }
}
