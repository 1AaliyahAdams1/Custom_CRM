import api from '../utils/api';

const RESOURCE = '/contacts';

export async function getAllContacts(onlyActive = true) {
  try {
    const response = await api.get(RESOURCE, { params: { onlyActive } });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getContactDetails(contactId) {
  try {
    const response = await api.get(`${RESOURCE}/${contactId}`);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getContactsByAccountId(accountName) {
  try {
    const response = await api.get(`${RESOURCE}/account/${accountName}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function createContact(contactData) {
  try {
    const response = await api.post(RESOURCE, contactData);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function updateContact(contactId, contactData) {
  try {
    const response = await api.put(`${RESOURCE}/${contactId}`, contactData);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function deactivateContact(contactId) {
  try {
    const response = await api.patch(`${RESOURCE}/${contactId}/deactivate`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function reactivateContact(contactId) {
  try {
    const response = await api.patch(`${RESOURCE}/${contactId}/reactivate`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteContact(contactId) {
  try {
    const response = await api.delete(`${RESOURCE}/${contactId}/delete`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function fetchContactsByUser(userId) {
  try {
    const response = await api.get(`/contacts/user/${userId}`);
  
    return response.data;
  } catch (error) {
    throw error;
  }
}