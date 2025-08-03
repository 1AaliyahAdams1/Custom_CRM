import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL_ALT;
const DEALS_URL = `${BASE_URL}/deals`;

// ===========================
// Get all deals
// ===========================
export async function getAllDeals() {
  const response = await axios.get(DEALS_URL);
  return response.data;
}

// ===========================
// Get deal details (with products, notes, attachments)
// ===========================
// export async function getDealDetails(dealId) {
//   const response = await axios.get(`${DEALS_URL}/${dealId}`);
//   return response.data;
// }
// Get deal by ID
export const fetchDealById = async (id) => {
  try {
    if (!id) throw new Error("Deal ID is required");
    return await axios.get(`${DEALS_URL}/${id}`);
  } catch (error) {
    console.error(`Error fetching deal ${id}:`, error);
    throw error;
  }
};


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

// ===========================
// Delete deal
// ===========================
export async function deleteDeal(dealId) {
  const response = await axios.delete(`${DEALS_URL}/${dealId}`);
  return response.data;
}
