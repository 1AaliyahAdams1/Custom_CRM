import api from '../utils/api';

const RESOURCE = '/entertainment-cities';

export async function getAllEntertainmentCities(onlyActive = true) {
  try {
    console.log('Calling getAllEntertainmentCities with onlyActive:', onlyActive);
    const response = await api.get(RESOURCE, { params: { onlyActive } });
    console.log('getAllEntertainmentCities response:', response);
    return response.data;
  } catch (error) {
    console.error('Error fetching entertainment cities:', error);
    throw error;
  }
}

export async function getEntertainmentCityDetails(entertainmentCityId) {
  try {
    console.log('Calling getEntertainmentCityDetails with ID:', entertainmentCityId);
    const response = await api.get(`${RESOURCE}/${entertainmentCityId}`);
    console.log('getEntertainmentCityDetails response:', response);
    return response;
  } catch (error) {
    console.error(`Error fetching entertainment city ${entertainmentCityId}:`, error);
    throw error;
  }
}

export async function searchEntertainmentCities(searchTerm) {
  try {
    console.log('Calling searchEntertainmentCities with searchTerm:', searchTerm);
    const response = await api.get(`${RESOURCE}/search`, { params: { q: searchTerm } });
    console.log('searchEntertainmentCities response:', response);
    return response.data;
  } catch (error) {
    console.error(`Error searching entertainment cities with term ${searchTerm}:`, error);
    throw error;
  }
}

export async function createEntertainmentCity(entertainmentCityData) {
  try {
    console.log('Calling createEntertainmentCity with data:', entertainmentCityData);
    const response = await api.post(RESOURCE, entertainmentCityData);
    console.log('createEntertainmentCity response:', response);
    return response.data;
  } catch (error) {
    console.error('Error creating entertainment city:', error);
    throw error;
  }
}

export async function updateEntertainmentCity(entertainmentCityId, entertainmentCityData) {
  try {
    console.log('Calling updateEntertainmentCity with ID:', entertainmentCityId, 'data:', entertainmentCityData);
    const response = await api.put(`${RESOURCE}/${entertainmentCityId}`, entertainmentCityData);
    console.log('updateEntertainmentCity response:', response);
    return response.data;
  } catch (error) {
    console.error(`Error updating entertainment city ${entertainmentCityId}:`, error);
    throw error;
  }
}

export async function getActiveEntertainmentCities() {
  try {
    console.log('Calling getActiveEntertainmentCities');
    const response = await api.get(`${RESOURCE}/active`);
    console.log('getActiveEntertainmentCities response:', response);
    return response.data;
  } catch (error) {
    console.error('Error fetching active entertainment cities:', error);
    throw error;
  }
}