import api from '../utils/api';

const RESOURCE = '/countries';

export async function getAllCountries(onlyActive = true) {
  try {
    console.log('Calling getAllCountries with onlyActive:', onlyActive);
    const response = await api.get(RESOURCE, { params: { onlyActive } });
    console.log('getAllCountries response:', response);
    console.log('getAllCountries response.data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching countries:', error);
    throw error;
  }
}

export async function getCountryDetails(countryId) {
  try {
    console.log('Calling getCountryDetails with ID:', countryId);
    const response = await api.get(`${RESOURCE}/${countryId}`);
    console.log('getCountryDetails response:', response);
    
    return response;
  } catch (error) {
    console.error(`Error fetching country ${countryId}:`, error);
    throw error;
  }
}

export async function getCountriesByCurrency(currencyId) {
  try {
    console.log('Calling getCountriesByCurrency with currencyId:', currencyId);
    const response = await api.get(`${RESOURCE}/currency/${currencyId}`);
    console.log('getCountriesByCurrency response:', response);
    return response.data;
  } catch (error) {
    console.error(`Error fetching countries for currency ${currencyId}:`, error);
    throw error;
  }
}

export async function searchCountries(searchTerm) {
  try {
    console.log('Calling searchCountries with searchTerm:', searchTerm);
    const response = await api.get(`${RESOURCE}/search`, { params: { q: searchTerm } });
    console.log('searchCountries response:', response);
    return response.data;
  } catch (error) {
    console.error(`Error searching countries with term ${searchTerm}:`, error);
    throw error;
  }
}

export async function createCountry(countryData) {
  try {
    console.log('Calling createCountry with data:', countryData);
    const response = await api.post(RESOURCE, countryData);
    console.log('createCountry response:', response);
    return response.data;
  } catch (error) {
    console.error('Error creating country:', error);
    throw error;
  }
}

export async function updateCountry(countryId, countryData) {
  try {
    console.log('Calling updateCountry with ID:', countryId, 'data:', countryData);
    const response = await api.put(`${RESOURCE}/${countryId}`, countryData);
    console.log('updateCountry response:', response);
    return response.data;
  } catch (error) {
    console.error(`Error updating country ${countryId}:`, error);
    throw error;
  }
}

export async function deactivateCountry(countryId) {
  try {
    console.log('Calling deactivateCountry with ID:', countryId);
    const response = await api.patch(`${RESOURCE}/${countryId}/deactivate`);
    console.log('deactivateCountry response:', response);
    return response.data;
  } catch (error) {
    console.error(`Error deactivating country ${countryId}:`, error);
    throw error;
  }
}

export async function reactivateCountry(countryId) {
  try {
    console.log('Calling reactivateCountry with ID:', countryId);
    const response = await api.patch(`${RESOURCE}/${countryId}/reactivate`);
    console.log('reactivateCountry response:', response);
    return response.data;
  } catch (error) {
    console.error(`Error reactivating country ${countryId}:`, error);
    throw error;
  }
}

export async function deleteCountry(countryId) {
  try {
    console.log('Calling deleteCountry with ID:', countryId);
    const response = await api.delete(`${RESOURCE}/${countryId}/delete`);
    console.log('deleteCountry response:', response);
    return response.data;
  } catch (error) {
    console.error(`Error deleting country ${countryId}:`, error);
    throw error;
  }
}

export async function getCountryByCode(countryCode) {
  try {
    console.log('Calling getCountryByCode with code:', countryCode);
    const response = await api.get(`${RESOURCE}/code/${countryCode}`);
    console.log('getCountryByCode response:', response);
    return response.data;
  } catch (error) {
    console.error(`Error fetching country by code ${countryCode}:`, error);
    throw error;
  }
}

export async function getActiveCountries() {
  try {
    console.log('Calling getActiveCountries');
    const response = await api.get(`${RESOURCE}/active`);
    console.log('getActiveCountries response:', response);
    console.log('getActiveCountries response.data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching active countries:', error);
    throw error;
  }
}