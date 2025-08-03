const contactService = require("../services/contactService");

async function getAllContacts(req, res) {
  try {
    const contacts = await contactService.getAllContacts();
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getContactDetails(req, res) {
  try {
    const contact = await contactService.getContactDetails(req.params.id);
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getContactsByAccountId(req, res) {
  try {
    const contacts = await contactService.getContactsByAccountId(req.params.accountName);
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createContact(req, res) {
  try {
    const result = await contactService.createContact(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateContact(req, res) {
  try {
    const result = await contactService.updateContact(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deactivateContact(req, res) {
  try {
    const result = await contactService.deactivateContact(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function reactivateContact(req, res) {
  try {
    const result = await contactService.reactivateContact(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteContact(req, res) {
  try {
    const result = await contactService.deleteContact(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getAllContacts,
  getContactDetails,          
  getContactsByAccountId,
  createContact,
  updateContact,
  deactivateContact,
  reactivateContact,
  deleteContact,
};
