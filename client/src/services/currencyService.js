import api from '../utils/api';

const RESOURCE = '/currencies';

// Get all currencies
export async function getAllCurrencies() {
  try {
    const response = await api.get(RESOURCE);
    return response.data;
  } catch (error) {
    console.error('Error fetching all currencies:', error);
    throw error;
  }
}

// Get currency by ID
export async function getCurrencyById(id) {
  if (!id) throw new Error('Currency ID is required');
  try {
    const response = await api.get(`${RESOURCE}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching currency ${id}:`, error);
    throw error;
  }
}

// Create a new currency
export async function createCurrency(data) {
  if (!data.Symbol || !data.ISOcode) throw new Error('Symbol and ISOcode are required');
  try {
    const response = await api.post(RESOURCE, data);
    return response.data;
  } catch (error) {
    console.error('Error creating currency:', error);
    throw error;
  }
}

// Update currency
export async function updateCurrency(id, data) {
  if (!id) throw new Error('Currency ID is required');
  try {
    const response = await api.put(`${RESOURCE}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating currency ${id}:`, error);
    throw error;
  }
}

// Deactivate currency
export async function deactivateCurrency(id) {
  if (!id) throw new Error('Currency ID is required');
  try {
    const response = await api.patch(`${RESOURCE}/${id}/deactivate`);
    return response.data;
  } catch (error) {
    console.error(`Error deactivating currency ${id}:`, error);
    throw error;
  }
}

// Reactivate currency
export async function reactivateCurrency(id) {
  if (!id) throw new Error('Currency ID is required');
  try {
    const response = await api.patch(`${RESOURCE}/${id}/reactivate`);
    return response.data;
  } catch (error) {
    console.error(`Error reactivating currency ${id}:`, error);
    throw error;
  }
}

// Hard delete currency
export async function deleteCurrency(id) {
  if (!id) throw new Error('Currency ID is required');
  try {
    const response = await api.delete(`${RESOURCE}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting currency ${id}:`, error);
    throw error;
  }
}
