import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL_ALT;
const PERSONS_API = `${BASE_URL}/persons`;

// Get all persons
export async function getAllPersons() {
  try {
    const response = await axios.get(PERSONS_API);
    return response.data;
  } catch (error) {
    console.error("Error fetching persons:", error);
    throw error;
  }
}

// Get person by ID
export async function getPersonById(personId) {
  try {
    const response = await axios.get(`${PERSONS_API}/${personId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching person ${personId}:`, error);
    throw error;
  }
}

// Create new person
export async function createPerson(personData) {
  try {
    const response = await axios.post(PERSONS_API, personData);
    return response.data; // assume backend returns created person object or ID
  } catch (error) {
    console.error("Error creating person:", error);
    throw error;
  }
}

// Update person
export async function updatePerson(personId, personData) {
  try {
    const response = await axios.put(`${PERSONS_API}/${personId}`, personData);
    return response.data;
  } catch (error) {
    console.error(`Error updating person ${personId}:`, error);
    throw error;
  }
}

// Deactivate person
export async function deactivatePerson(personId) {
  try {
    const response = await axios.patch(`${PERSONS_API}/${personId}/deactivate`);
    return response.data;
  } catch (error) {
    console.error(`Error deactivating person ${personId}:`, error);
    throw error;
  }
}

// Reactivate person
export async function reactivatePerson(personId) {
  try {
    const response = await axios.patch(`${PERSONS_API}/${personId}/reactivate`);
    return response.data;
  } catch (error) {
    console.error(`Error reactivating person ${personId}:`, error);
    throw error;
  }
}

// Delete person
export async function deletePerson(personId) {
  try {
    const response = await axios.delete(`${PERSONS_API}/${personId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting person ${personId}:`, error);
    throw error;
  }
}
