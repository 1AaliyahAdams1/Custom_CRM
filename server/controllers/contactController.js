const contactService = require("../services/contactService");

async function getAllContacts(req, res) {
  const contacts = await contactService.getAllContacts();
  res.json(contacts);
}

async function getContactById(req, res) {
  const contact = await contactService.getContactDetails(req.params.id);
  res.json(contact);
}

async function getContactsByAccountId(req, res) {
  const contacts = await contactService.getContactsByAccountId(req.params.accountId);
  res.json(contacts);
}

async function createContact(req, res) {
  const result = await contactService.createContact(req.body, req.body.changedBy || 0);
  res.status(201).json(result);
}

async function updateContact(req, res) {
  const result = await contactService.updateContact(req.params.id, req.body, req.body.changedBy || 0);
  res.json(result);
}

async function deleteContact(req, res) {
  const result = await contactService.deleteContact(req.params.id, req.body.changedBy || 0);
  res.json(result);
}

module.exports = {
  getAllContacts,
  getContactById,
  getContactsByAccountId,
  createContact,
  updateContact,
  deleteContact,
};
