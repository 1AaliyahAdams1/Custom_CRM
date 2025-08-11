import api from '../utils/api';

const RESOURCE = '/persons';

export async function getAllPersons() {
  try {
    const response = await api.get(RESOURCE);
    return response.data;
  } catch (error) {
    console.error('Error fetching persons:', error);
    throw error;
  }
}

export async function getPersonById(personId) {
  try {
    return await api.get(`${RESOURCE}/${personId}`);
  } catch (error) {
    console.error(`Error fetching person ${personId}:`, error);
    throw error;
  }
}

export async function createPerson(personData) {
  try {
    const response = await api.post(RESOURCE, personData);
    return response.data;
  } catch (error) {
    console.error('Error creating person:', error);
    throw error;
  }
}

export async function updatePerson(personId, personData) {
  try {
    const response = await api.put(`${RESOURCE}/${personId}`, personData);
    return response.data;
  } catch (error) {
    console.error(`Error updating person ${personId}:`, error);
    throw error;
  }
}

export async function deactivatePerson(personId) {
  try {
    const response = await api.patch(`${RESOURCE}/${personId}/deactivate`);
    return response.data;
  } catch (error) {
    console.error(`Error deactivating person ${personId}:`, error);
    throw error;
  }
}

export async function reactivatePerson(personId) {
  try {
    const response = await api.patch(`${RESOURCE}/${personId}/reactivate`);
    return response.data;
  } catch (error) {
    console.error(`Error reactivating person ${personId}:`, error);
    throw error;
  }
}

export async function deletePerson(personId) {
  try {
    const response = await api.delete(`${RESOURCE}/${personId}/delete`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting person ${personId}:`, error);
    throw error;
  }
}
