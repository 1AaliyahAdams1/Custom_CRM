// SERVICE : Contact Service
// Service module for handling all API calls related to contacts

//IMPORTS
import axios from "axios";

// Set base URLs from environment
const baseApiUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL_ALT;

// Full endpoint for contact-related API requests
const DB_URL = `${baseApiUrl}/contact`;

// Fetch all contacts from the server
export const getContacts = async () => {
  try {
    const response = await axios.get(DB_URL);
    // Return the list of contacts received from API
    return response.data;
  } catch (error) {
    // Throw error with backend message or fallback message
    throw new Error(
      error.response?.data?.error || error.message || "Failed to fetch contacts"
    );
  }
};

// Create a new contact by sending contact data to the backend
export const createContact = async (contact) => {
  try {
    const response = await axios.post(DB_URL, contact);
    // Return newly created contact data from API
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || error.message || "Failed to create contact"
    );
  }
};

// Update an existing contact identified by ID with new data
export const updateContact = async (id, contact) => {
  try {
    const response = await axios.put(`${DB_URL}/${id}`, contact);
    // Return updated contact data from API
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || error.message || "Failed to update contact"
    );
  }
};

// Delete a contact from the backend by its ID
export const deleteContact = async (id) => {
  try {
    const response = await axios.delete(`${DB_URL}/${id}`);
    // Return response confirming deletion
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || error.message || "Failed to delete contact"
    );
  }
};

// Fetch details of a single contact by its ID
export const getContactDetails = async (id) => {
  if (!id) throw new Error("Contact ID is required");
  try {
    const response = await axios.get(`${DB_URL}/${id}`);
    // Return detailed contact data
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || error.message || "Failed to fetch contact details"
    );
  }
};
