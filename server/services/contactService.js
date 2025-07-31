const contactRepo = require("../data/contactRepository");

async function getAllContacts() {
  return await contactRepo.getAllContacts();
}

async function getContactDetails(contactId) {
  return await contactRepo.getContactDetails(contactId);
}

async function getContactsByAccountId(accountId) {
  return await contactRepo.getContactsByAccountId(accountId);
}

async function createContact(data, changedBy) {
  return await contactRepo.createContact(data, changedBy);
}

async function updateContact(contactId, data, changedBy) {
  return await contactRepo.updateContact(contactId, data, changedBy);
}

async function deleteContact(contactId, changedBy) {
  return await contactRepo.deleteContact(contactId, changedBy);
}

module.exports = {
  getAllContacts,
  getContactDetails,
  getContactsByAccountId,
  createContact,
  updateContact,
  deleteContact,
};
