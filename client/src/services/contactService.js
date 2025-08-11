import api from '../utils/api';

const RESOURCE = '/contacts';

export async function getAllContacts(onlyActive = true) {
  try {
    const response = await api.get(RESOURCE, { params: { onlyActive } });
    return response.data;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
}

export async function getContactDetails(contactId) {
  try {
    const response = await api.get(`${RESOURCE}/${contactId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching contact ${contactId}:`, error);
    throw error;
  }
}

export async function getContactsByAccountId(accountName) {
  try {
    const response = await api.get(`${RESOURCE}/account/${accountName}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching contacts for account ${accountName}:`, error);
    throw error;
  }
}

export async function createContact(contactData) {
  try {
    const response = await api.post(RESOURCE, contactData);
    return response.data;
  } catch (error) {
    console.error('Error creating contact:', error);
    throw error;
  }
}

export async function updateContact(contactId, contactData) {
  try {
    const response = await api.put(`${RESOURCE}/${contactId}`, contactData);
    return response.data;
  } catch (error) {
    console.error(`Error updating contact ${contactId}:`, error);
    throw error;
  }
}

export async function deactivateContact(contactId) {
  try {
    const response = await api.patch(`${RESOURCE}/${contactId}/deactivate`);
    return response.data;
  } catch (error) {
    console.error(`Error deactivating contact ${contactId}:`, error);
    throw error;
  }
}

export async function reactivateContact(contactId) {
  try {
    const response = await api.patch(`${RESOURCE}/${contactId}/reactivate`);
    return response.data;
  } catch (error) {
    console.error(`Error reactivating contact ${contactId}:`, error);
    throw error;
  }
}

export async function deleteContact(contactId) {
  try {
    const response = await api.delete(`${RESOURCE}/${contactId}/delete`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting contact ${contactId}:`, error);
    throw error;
  }
}
