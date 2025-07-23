import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL_ALT;
const RESOURCE = `${BASE_URL}/accounts`;

// ===========================
// Get all accounts
// ===========================
export async function getAllAccounts() {
  const response = await axios.get(RESOURCE);
  return response.data;
}

// ===========================
// Get details of a specific account (with notes & attachments)
// ===========================
export async function getAccountDetails(accountId) {
  const response = await axios.get(`${RESOURCE}/${accountId}`);
  return response.data;
}

// ===========================
// Create a new account
// ===========================
export async function createAccount(accountData, changedBy = "System") {
  const payload = { ...accountData, changedBy };
  const response = await axios.post(RESOURCE, payload);
  return response.data;
}

// ===========================
// Update an existing account
// ===========================
export async function updateAccount(accountId, accountData, changedBy = "System") {
  const payload = { ...accountData, changedBy };
  const response = await axios.put(`${RESOURCE}/${accountId}`, payload);
  return response.data;
}

// ===========================
// Delete an account
// ===========================
export async function deleteAccount(accountId, changedBy = "System") {
  const response = await axios.delete(`${RESOURCE}/${accountId}`, {
    data: { changedBy },
  });
  return response.data;
}
