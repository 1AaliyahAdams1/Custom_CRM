import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL_ALT;
const DEALS_URL = `${BASE_URL}/deals`;

// ===========================
// Get all deals
// ===========================
export async function getAllDeals(onlyActive = true) {
  const response = await axios.get(DEALS_URL, {
    params: { onlyActive }
  });
  return response.data;
}
// ===========================
// Get deal details (with products, notes, attachments)
// ===========================
export async function getDealDetails(dealId) {
  const response = await axios.get(`${DEALS_URL}/${dealId}`);
  return response.data;
}

// ===========================
// Create new deal
// ===========================
export async function createDeal(dealData) {
  const response = await axios.post(DEALS_URL, dealData);
  return response.data;
}

// ===========================
// Update existing deal
// ===========================
export async function updateDeal(dealId, dealData) {
  const response = await axios.put(`${DEALS_URL}/${dealId}`, dealData);
  return response.data;
}

// Deactivate a deal 
export async function deactivateDeal(dealId) {
  try {
    const response = await axios.patch(`${DEALS_URL}/${dealId}/deactivate`);
    return response.data;
  } catch (error) {
    console.error(`Error deactivating deal ${dealId}:`, error);
    throw error;
  }
}

// Reactivate a deal
export async function reactivateDeal(dealId) {
  try {
    const response = await axios.patch(`${DEALS_URL}/${dealId}/reactivate`);
    return response.data;
  } catch (error) {
    console.error(`Error reactivating deal ${dealId}:`, error);
    throw error;
  }
}

// ===========================
// Delete deal
// ===========================
export async function deleteDeal(dealId) {
  const response = await axios.delete(`${DEALS_URL}/${dealId}/delete`);
  return response.data;
}