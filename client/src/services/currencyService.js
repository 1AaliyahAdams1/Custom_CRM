import api from '../utils/api';

const RESOURCE = '/currencies';

export async function getAllCurrencies(onlyActive = true) {
  try {
    console.log('Calling getAllCurrencies with onlyActive:', onlyActive);
    const response = await api.get(RESOURCE, { params: { onlyActive } });
    console.log('getAllCurrencies response:', response);
    return response.data;
  } catch (error) {
    console.error('Error fetching currencies:', error);
    throw error;
  }
}

export async function getCurrencyDetails(currencyId) {
  try {
    console.log('Calling getCurrencyDetails with ID:', currencyId);
    const response = await api.get(`${RESOURCE}/${currencyId}`);
    console.log('getCurrencyDetails response:', response);
    return response;
  } catch (error) {
    console.error(`Error fetching currency ${currencyId}:`, error);
    throw error;
  }
}

export async function searchCurrencies(searchTerm) {
  try {
    console.log('Calling searchCurrencies with searchTerm:', searchTerm);
    const response = await api.get(`${RESOURCE}/search`, { params: { q: searchTerm } });
    console.log('searchCurrencies response:', response);
    return response.data;
  } catch (error) {
    console.error(`Error searching currencies with term ${searchTerm}:`, error);
    throw error;
  }
}

export async function createCurrency(currencyData) {
  try {
    console.log('Calling createCurrency with data:', currencyData);
    const response = await api.post(RESOURCE, currencyData);
    console.log('createCurrency response:', response);
    return response.data;
  } catch (error) {
    console.error('Error creating currency:', error);
    throw error;
  }
}

export async function updateCurrency(currencyId, currencyData) {
  try {
    console.log('Calling updateCurrency with ID:', currencyId, 'data:', currencyData);
    const response = await api.put(`${RESOURCE}/${currencyId}`, currencyData);
    console.log('updateCurrency response:', response);
    return response.data;
  } catch (error) {
    console.error(`Error updating currency ${currencyId}:`, error);
    throw error;
  }
}

export async function getActiveCurrencies() {
  try {
    console.log('Calling getActiveCurrencies');
    const response = await api.get(`${RESOURCE}/active`);
    console.log('getActiveCurrencies response:', response);
    return response.data;
  } catch (error) {
    console.error('Error fetching active currencies:', error);
    throw error;
  }
}