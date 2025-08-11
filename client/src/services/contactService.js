import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL_ALT;
const CONTACTS_API = `${BASE_URL}/contacts`;

// Get all contacts
export async function getAllContacts(onlyActive = true) {
  try {
    const response = await axios.get(CONTACTS_API, {
      params: { onlyActive }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching contacts:", error);
    throw error;
  }
}

// Get all contact details
export async function getAllContactDetails(onlyActive = true) {
  try {
    const response = await axios.get(CONTACTS_API, {
      params: { onlyActive }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching contacts:", error);
    throw error;
  }
}

// Get contact details by ID
export async function getContactDetails(contactId) {
  try {
    const response = await axios.get(`${CONTACTS_API}/${contactId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching contact ${contactId}:`, error);
    throw error;
  }
}

// Get contacts by account name
export async function getContactsByAccountId(accountName) {
  try {
    const response = await axios.get(`${CONTACTS_API}/account/${accountName}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching contacts for account ${accountName}:`, error);
    throw error;
  }
}

// Create a new contact
export async function createContact(contactData) {
  try {
    const response = await axios.post(CONTACTS_API, contactData);
    return response.data;
  } catch (error) {
    console.error("Error creating contact:", error);
    throw error;
  }
}

// Update a contact
export async function updateContact(contactId, contactData) {
  try {
    const response = await axios.put(`${CONTACTS_API}/${contactId}`, contactData);
    return response.data;
  } catch (error) {
    console.error(`Error updating contact ${contactId}:`, error);
    throw error;
  }
}

// Deactivate a contact 
export async function deactivateContact(contactId) {
  try {
    const response = await axios.patch(`${CONTACTS_API}/${contactId}/deactivate`);
    return response.data;
  } catch (error) {
    console.error(`Error deactivating contact ${contactId}:`, error);
    throw error;
  }
}

// Reactivate a contact
export async function reactivateContact(contactId) {
  try {
    const response = await axios.patch(`${CONTACTS_API}/${contactId}/reactivate`);
    return response.data;
  } catch (error) {
    console.error(`Error reactivating contact ${contactId}:`, error);
    throw error;
  }
}

// Delete a contact
export async function deleteContact(contactId) {
  try {
    const response = await axios.delete(`${CONTACTS_API}/${contactId}/delete`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting contact ${contactId}:`, error);
    throw error;
  }
}
