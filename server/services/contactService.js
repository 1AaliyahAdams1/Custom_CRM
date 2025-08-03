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

async function createContact(data) {
  return await contactRepo.createContact(data);
}

async function updateContact(contactId, data) {
  return await contactRepo.updateContact(contactId, data);
}

async function deleteContact(contactId) {
  return await contactRepo.deleteContact(contactId);
}

module.exports = {
  getAllContacts,
  getContactDetails,
  getContactsByAccountId,
  createContact,
  updateContact,
  deleteContact,
};
