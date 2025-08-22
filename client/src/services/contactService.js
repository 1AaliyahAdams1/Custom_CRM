import api from '../utils/api';

const RESOURCE = '/contacts';

export async function getAllContacts(onlyActive = true) {
  try {
    console.log('Calling getAllContacts with onlyActive:', onlyActive);
    const response = await api.get(RESOURCE, { params: { onlyActive } });
    console.log('getAllContacts response:', response);
    console.log('getAllContacts response.data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
}

export async function getContactDetails(contactId) {
  try {
    console.log('Calling getContactDetails with ID:', contactId);
    const response = await api.get(`${RESOURCE}/${contactId}`);
    console.log('getContactDetails response:', response);
    
    return response;
  } catch (error) {
    console.error(`Error fetching contact ${contactId}:`, error);
    throw error;
  }
}

export async function getContactsByAccountId(accountName) {
  try {
    console.log('Calling getContactsByAccountId with accountName:', accountName);
    const response = await api.get(`${RESOURCE}/account/${accountName}`);
    console.log('getContactsByAccountId response:', response);
    return response.data;
  } catch (error) {
    console.error(`Error fetching contacts for account ${accountName}:`, error);
    throw error;
  }
}

export async function createContact(contactData) {
  try {
    console.log('Calling createContact with data:', contactData);
    const response = await api.post(RESOURCE, contactData);
    console.log('createContact response:', response);
    return response.data;
  } catch (error) {
    console.error('Error creating contact:', error);
    throw error;
  }
}

export async function updateContact(contactId, contactData) {
  try {
    console.log('Calling updateContact with ID:', contactId, 'data:', contactData);
    const response = await api.put(`${RESOURCE}/${contactId}`, contactData);
    console.log('updateContact response:', response);
    return response.data;
  } catch (error) {
    console.error(`Error updating contact ${contactId}:`, error);
    throw error;
  }
}

export async function deactivateContact(contactId) {
  try {
    console.log('Calling deactivateContact with ID:', contactId);
    const response = await api.patch(`${RESOURCE}/${contactId}/deactivate`);
    console.log('deactivateContact response:', response);
    return response.data;
  } catch (error) {
    console.error(`Error deactivating contact ${contactId}:`, error);
    throw error;
  }
}

export async function reactivateContact(contactId) {
  try {
    console.log('Calling reactivateContact with ID:', contactId);
    const response = await api.patch(`${RESOURCE}/${contactId}/reactivate`);
    console.log('reactivateContact response:', response);
    return response.data;
  } catch (error) {
    console.error(`Error reactivating contact ${contactId}:`, error);
    throw error;
  }
}

export async function deleteContact(contactId) {
  try {
    console.log('Calling deleteContact with ID:', contactId);
    const response = await api.delete(`${RESOURCE}/${contactId}/delete`);
    console.log('deleteContact response:', response);
    return response.data;
  } catch (error) {
    console.error(`Error deleting contact ${contactId}:`, error);
    throw error;
  }
}

export async function fetchContactsByUser(userId) {
  try {
    console.log('Calling fetchContactsByUser with userId:', userId);
    const response = await api.get(`/contacts/user/${userId}`);
    console.log('fetchContactsByUser response:', response);
    console.log('fetchContactsByUser response.data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching contacts by user ${userId}:`, error);
    throw error;
  }
}