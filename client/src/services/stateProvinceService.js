import api from '../utils/api';

const RESOURCE = '/states'; 

export async function getAllStatesProvinces(onlyActive = true) {
  try {
    console.log('Calling getAllStatesProvinces with onlyActive:', onlyActive);
    const response = await api.get(RESOURCE, { params: { onlyActive } });
    console.log('getAllStatesProvinces response:', response);
    return response.data;
  } catch (error) {
    console.error('Error fetching states/provinces:', error);
    throw error;
  }
}

export async function getStateProvinceDetails(stateProvinceId) {
  try {
    console.log('Calling getStateProvinceDetails with ID:', stateProvinceId);
    const response = await api.get(`${RESOURCE}/${stateProvinceId}`);
    console.log('getStateProvinceDetails response:', response);
    return response;
  } catch (error) {
    console.error(`Error fetching state/province ${stateProvinceId}:`, error);
    throw error;
  }
}

export async function getStateProvincesByCountry(countryId) {
  try {
    console.log('Calling getStateProvincesByCountry with countryId:', countryId);
    const response = await api.get(`${RESOURCE}/country/${countryId}`);
    console.log('getStateProvincesByCountry response:', response);
    return response.data;
  } catch (error) {
    console.error(`Error fetching states/provinces for country ${countryId}:`, error);
    throw error;
  }
}

export async function searchStatesProvinces(searchTerm) {
  try {
    console.log('Calling searchStatesProvinces with searchTerm:', searchTerm);
    const response = await api.get(`${RESOURCE}/search`, { params: { q: searchTerm } });
    console.log('searchStatesProvinces response:', response);
    return response.data;
  } catch (error) {
    console.error(`Error searching states/provinces with term ${searchTerm}:`, error);
    throw error;
  }
}

export async function createStateProvince(stateProvinceData) {
  try {
    console.log('Calling createStateProvince with data:', stateProvinceData);
    const response = await api.post(RESOURCE, stateProvinceData);
    console.log('createStateProvince response:', response);
    return response.data;
  } catch (error) {
    console.error('Error creating state/province:', error);
    throw error;
  }
}

export async function updateStateProvince(stateProvinceId, stateProvinceData) {
  try {
    console.log('Calling updateStateProvince with ID:', stateProvinceId, 'data:', stateProvinceData);
    const response = await api.put(`${RESOURCE}/${stateProvinceId}`, stateProvinceData);
    console.log('updateStateProvince response:', response);
    return response.data;
  } catch (error) {
    console.error(`Error updating state/province ${stateProvinceId}:`, error);
    throw error;
  }
}

export async function deactivateStateProvince(stateProvinceId) {
  try {
    console.log('Calling deactivateStateProvince with ID:', stateProvinceId);
    const response = await api.patch(`${RESOURCE}/${stateProvinceId}/deactivate`);
    console.log('deactivateStateProvince response:', response);
    return response.data;
  } catch (error) {
    console.error(`Error deactivating state/province ${stateProvinceId}:`, error);
    throw error;
  }
}

export async function reactivateStateProvince(stateProvinceId) {
  try {
    console.log('Calling reactivateStateProvince with ID:', stateProvinceId);
    const response = await api.patch(`${RESOURCE}/${stateProvinceId}/reactivate`);
    console.log('reactivateStateProvince response:', response);
    return response.data;
  } catch (error) {
    console.error(`Error reactivating state/province ${stateProvinceId}:`, error);
    throw error;
  }
}

export async function deleteStateProvince(stateProvinceId) {
  try {
    console.log('Calling deleteStateProvince with ID:', stateProvinceId);
    const response = await api.delete(`${RESOURCE}/${stateProvinceId}/delete`);
    console.log('deleteStateProvince response:', response);
    return response.data;
  } catch (error) {
    console.error(`Error deleting state/province ${stateProvinceId}:`, error);
    throw error;
  }
}

export async function getActiveStatesProvinces() {
  try {
    console.log('Calling getActiveStatesProvinces');
    const response = await api.get(`${RESOURCE}/active`);
    console.log('getActiveStatesProvinces response:', response);
    return response.data;
  } catch (error) {
    console.error('Error fetching active states/provinces:', error);
    throw error;
  }
}