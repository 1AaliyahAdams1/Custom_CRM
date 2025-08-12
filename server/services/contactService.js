const contactRepo = require("../data/contactRepository");

async function getAllContacts(onlyActive = true) {
  return await contactRepo.getAllContacts(onlyActive = true);
}

async function getAllContactDetails(onlyActive = true) {
  return await contactRepo.getAllContactDetails(onlyActive = true)
}

async function getContactDetails(contactId) {
  return await contactRepo.getContactDetails(contactId);
}

async function createContact(data, changedBy = 1) {
  return await contactRepo.createContact(data, changedBy, 1);
}

async function updateContact(contactId, data, changedBy = 1) {
  return await contactRepo.updateContact(contactId, data, changedBy);
}


async function deactivateContact(contactId, changedBy = 1) {
  return await contactRepo.deactivateContact(contactId, changedBy);
}


async function reactivateContact(contactId, changedBy = 1) {
  return await contactRepo.reactivateContact(contactId, changedBy);
}

async function deleteContact(contactId, changedBy = 1) {
  return await contactRepo.deleteContact(contactId, changedBy);
}


async function getContactsByAccountId(accountName) {
  return await contactRepo.getContactsByAccountId(accountName);
}

async function getContactsByUser(userID) {
  return await contactRepo.getContactsByUser(userID);
}


module.exports = {
  getAllContacts,
  getAllContactDetails,
  getContactDetails,
  createContact,
  updateContact,
  deactivateContact,
  reactivateContact,
  deleteContact,
  getContactsByAccountId,
  getContactsByUser,
};
