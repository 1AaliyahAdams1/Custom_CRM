import api from '../utils/api';

const RESOURCE = '/cities';

export async function getAllCities(onlyActive = true) {
  try {
    console.log('Calling getAllCities with onlyActive:', onlyActive);
    const response = await api.get(RESOURCE, { params: { onlyActive } });
    console.log('getAllCities response:', response);
    return response.data;
  } catch (error) {
    console.error('Error fetching cities:', error);
    throw error;
  }
}

export async function getCityDetails(cityId) {
  try {
    console.log('Calling getCityDetails with ID:', cityId);
    const response = await api.get(`${RESOURCE}/${cityId}`);
    console.log('getCityDetails response:', response);
    return response;
  } catch (error) {
    console.error(`Error fetching city ${cityId}:`, error);
    throw error;
  }
}

export async function getCitiesByStateProvince(stateProvinceId) {
  try {
    console.log('Calling getCitiesByStateProvince with stateProvinceId:', stateProvinceId);
    const response = await api.get(`${RESOURCE}/stateProvince/${stateProvinceId}`);
    console.log('getCitiesByStateProvince response:', response);
    return response.data;
  } catch (error) {
    console.error(`Error fetching cities for state/province ${stateProvinceId}:`, error);
    throw error;
  }
}

export async function getCitiesByCountry(countryId) {
  try {
    console.log('Calling getCitiesByCountry with countryId:', countryId);
    const response = await api.get(`${RESOURCE}/country/${countryId}`);
    console.log('getCitiesByCountry response:', response);
    return response.data;
  } catch (error) {
    console.error(`Error fetching cities for country ${countryId}:`, error);
    throw error;
  }
}

export async function searchCities(searchTerm) {
  try {
    console.log('Calling searchCities with searchTerm:', searchTerm);
    const response = await api.get(`${RESOURCE}/search`, { params: { q: searchTerm } });
    console.log('searchCities response:', response);
    return response.data;
  } catch (error) {
    console.error(`Error searching cities with term ${searchTerm}:`, error);
    throw error;
  }
}

export async function createCity(cityData) {
  try {
    console.log('Calling createCity with data:', cityData);
    const response = await api.post(RESOURCE, cityData);
    console.log('createCity response:', response);
    return response.data;
  } catch (error) {
    console.error('Error creating city:', error);
    throw error;
  }
}

export async function updateCity(cityId, cityData) {
  try {
    console.log('Calling updateCity with ID:', cityId, 'data:', cityData);
    const response = await api.put(`${RESOURCE}/${cityId}`, cityData);
    console.log('updateCity response:', response);
    return response.data;
  } catch (error) {
    console.error(`Error updating city ${cityId}:`, error);
    throw error;
  }
}

export async function deactivateCity(cityId) {
  try {
    console.log('Calling deactivateCity with ID:', cityId);
    const response = await api.patch(`${RESOURCE}/${cityId}/deactivate`);
    console.log('deactivateCity response:', response);
    return response.data;
  } catch (error) {
    console.error(`Error deactivating city ${cityId}:`, error);
    throw error;
  }
}

export async function reactivateCity(cityId) {
  try {
    console.log('Calling reactivateCity with ID:', cityId);
    const response = await api.patch(`${RESOURCE}/${cityId}/reactivate`);
    console.log('reactivateCity response:', response);
    return response.data;
  } catch (error) {
    console.error(`Error reactivating city ${cityId}:`, error);
    throw error;
  }
}

export async function deleteCity(cityId) {
  try {
    console.log('Calling deleteCity with ID:', cityId);
    const response = await api.delete(`${RESOURCE}/${cityId}/delete`);
    console.log('deleteCity response:', response);
    return response.data;
  } catch (error) {
    console.error(`Error deleting city ${cityId}:`, error);
    throw error;
  }
}

export async function getActiveCities() {
  try {
    console.log('Calling getActiveCities');
    const response = await api.get(`${RESOURCE}/active`);
    console.log('getActiveCities response:', response);
    return response.data;
  } catch (error) {
    console.error('Error fetching active cities:', error);
    throw error;
  }
}