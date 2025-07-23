import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL_ALT;
const CONTACTS_URL = `${BASE_URL}/contacts`;
const PERSONS_URL = `${BASE_URL}/persons`;

// ===========================
// Get all contacts
// ===========================
export async function getAllContacts() {
  const response = await axios.get(CONTACTS_URL);
  return response.data;
}

// ===========================
// Get all persons (used for selection/dropdowns)
// ===========================
export async function getAllPersons() {
  const response = await axios.get(PERSONS_URL);
  return response.data;
}

// ===========================
// Get detailed contact (with person, notes, attachments)
// ===========================
export async function getContactDetails(contactId) {
  const response = await axios.get(`${CONTACTS_URL}/${contactId}`);
  return response.data;
}

// ===========================
// Create a contact (with optional new person)
// ===========================
export async function createContact(contactData) {
  const response = await axios.post(CONTACTS_URL, contactData);
  return response.data;
}

// ===========================
// Update a contact
// ===========================
export async function updateContact(contactId, contactData) {
  const response = await axios.put(`${CONTACTS_URL}/${contactId}`, contactData);
  return response.data;
}

// ===========================
// Delete a contact
// ===========================
export async function deleteContact(contactId) {
  const response = await axios.delete(`${CONTACTS_URL}/${contactId}`);
  return response.data;
}
