import api from '../utils/api';

const RESOURCE = '/deals';

export async function getAllDeals(onlyActive = true) {
  try {
    const response = await api.get(RESOURCE, { params: { onlyActive } });
    return response.data;
  } catch (error) {
    console.error('Error fetching deals:', error);
    throw error;
  }
}

export const fetchDealById = async (id) => {
  if (!id) throw new Error('Deal ID is required');
  try {
    return await api.get(`${RESOURCE}/${id}`);
  } catch (error) {
    console.error(`Error fetching deal ${id}:`, error);
    throw error;
  }
};

export async function createDeal(dealData) {
  try {
    const response = await api.post(RESOURCE, dealData);
    return response.data;
  } catch (error) {
    console.error('Error creating deal:', error);
    throw error;
  }
}

export async function updateDeal(dealId, dealData) {
  try {
    const response = await api.put(`${RESOURCE}/${dealId}`, dealData);
    return response.data;
  } catch (error) {
    console.error(`Error updating deal ${dealId}:`, error);
    throw error;
  }
}

export async function deactivateDeal(dealId) {
  if (!dealId) throw new Error('Deal ID is required');
  try {
    const response = await api.patch(`${RESOURCE}/${dealId}/deactivate`);
    return response.data;
  } catch (error) {
    console.error(`Error deactivating deal ${dealId}:`, error);
    throw error;
  }
}

export async function reactivateDeal(dealId) {
  if (!dealId) throw new Error('Deal ID is required');
  try {
    const response = await api.patch(`${RESOURCE}/${dealId}/reactivate`);
    return response.data;
  } catch (error) {
    console.error(`Error reactivating deal ${dealId}:`, error);
    throw error;
  }
}

export async function deleteDeal(dealId) {
  if (!dealId) throw new Error('Deal ID is required');
  try {
    const response = await api.delete(`${RESOURCE}/${dealId}/delete`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting deal ${dealId}:`, error);
    throw error;
  }
}
