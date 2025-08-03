const contactRepo = require("../repositories/contactRepository");

// Get all contacts
async function getAllContacts() {
  return await contactRepo.getAllContacts();
}

// Get contact details by ID
async function getContactDetails(contactId) {
  return await contactRepo.getContactDetails(contactId);
}

// Create a new contact
async function createContact(data, changedBy = 1) {
  return await contactRepo.createContact(data, changedBy, 1);
}

// Update contact
async function updateContact(contactId, data, changedBy = 1) {
  return await contactRepo.updateContact(contactId, data, changedBy);
}

// Deactivate contact (soft delete)
async function deactivateContact(contactId, changedBy = 1) {
  return await contactRepo.deactivateContact(contactId, changedBy);
}

// Reactivate contact
async function reactivateContact(contactId, changedBy = 1) {
  return await contactRepo.reactivateContact(contactId, changedBy);
}

// Hard delete contact (permanent delete)
async function deleteContact(contactId, changedBy = 1) {
  return await contactRepo.deleteContact(contactId, changedBy);
}

// Get contacts by account name
async function getContactsByAccountId(accountName) {
  return await contactRepo.getContactsByAccountId(accountName);
}

module.exports = {
  getAllContacts,
  getContactDetails,
  createContact,
  updateContact,
  deactivateContact,
  reactivateContact,
  deleteContact,
  getContactsByAccountId,
};
