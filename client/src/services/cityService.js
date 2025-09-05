import api from '../utils/api';

const RESOURCE = '/cities';

export async function getAllCities(onlyActive = true) {
  try {
    const response = await api.get(RESOURCE, { params: { onlyActive } });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getCityDetails(cityId) {
  try {
    const response = await api.get(`${RESOURCE}/${cityId}`);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getCitiesByStateProvince(stateProvinceId) {
  try {
    const response = await api.get(`${RESOURCE}/stateProvince/${stateProvinceId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getCitiesByCountry(countryId) {
  try {
    const response = await api.get(`${RESOURCE}/country/${countryId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function searchCities(searchTerm) {
  try {
    const response = await api.get(`${RESOURCE}/search`, { params: { q: searchTerm } });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function createCity(cityData) {
  try {
    const response = await api.post(RESOURCE, cityData);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function updateCity(cityId, cityData) {
  try {
    const response = await api.put(`${RESOURCE}/${cityId}`, cityData);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function deactivateCity(cityId) {
  try {
    const response = await api.patch(`${RESOURCE}/${cityId}/deactivate`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function reactivateCity(cityId) {
  try {
    const response = await api.patch(`${RESOURCE}/${cityId}/reactivate`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteCity(cityId) {
  try {
    const response = await api.delete(`${RESOURCE}/${cityId}/delete`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getActiveCities() {
  try {
    const response = await api.get(`${RESOURCE}/active`);
    return response.data;
  } catch (error) {
    throw error;
  }
}