import api from '../utils/api';

const RESOURCE = '/countries';

export async function getAllCountries(onlyActive = true) {
  try {

    const response = await api.get(RESOURCE, { params: { onlyActive } });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getCountryDetails(countryId) {
  try {
    const response = await api.get(`${RESOURCE}/${countryId}`);
    
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getCountriesByCurrency(currencyId) {
  try {
    const response = await api.get(`${RESOURCE}/currency/${currencyId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function searchCountries(searchTerm) {
  try {
    const response = await api.get(`${RESOURCE}/search`, { params: { q: searchTerm } });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function createCountry(countryData) {
  try {
    const response = await api.post(RESOURCE, countryData);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function updateCountry(countryId, countryData) {
  try {
    const response = await api.put(`${RESOURCE}/${countryId}`, countryData);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function deactivateCountry(countryId) {
  try {
    const response = await api.patch(`${RESOURCE}/${countryId}/deactivate`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function reactivateCountry(countryId) {
  try {
    const response = await api.patch(`${RESOURCE}/${countryId}/reactivate`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteCountry(countryId) {
  try {
    const response = await api.delete(`${RESOURCE}/${countryId}/delete`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getCountryByCode(countryCode) {
  try {
    const response = await api.get(`${RESOURCE}/code/${countryCode}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getActiveCountries() {
  try {
    const response = await api.get(`${RESOURCE}/active`);

    
    return response.data;
  } catch (error) {

    throw error;
  }
}