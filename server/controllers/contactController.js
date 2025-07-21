const contactService = require("../services/contactService");

// Helper to get changedBy from authenticated user or default
function getChangedBy(req) {
  return req.user?.username || "System";
}

// Get all contacts
async function getAllContacts(req, res) {
  try {
    // Validation can go here (e.g., filters, pagination params)
    const contacts = await contactService.getAllContacts();
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get all persons
async function getAllPersons(req, res) {
  try {
    // Validation can go here
    const persons = await contactService.getAllPersons();
    res.json(persons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Create a new contact (with optional new person)
async function createContact(req, res) {
  // Validation for req.body should go here

  try {
    const changedBy = getChangedBy(req);
    const newContact = await contactService.createContact(req.body, changedBy);
    res.status(201).json(newContact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update a contact by ID
async function updateContact(req, res) {
  const id = parseInt(req.params.id, 10);
  // Validation for id and req.body goes here

  try {
    const changedBy = getChangedBy(req);
    const updatedContact = await contactService.updateContact(id, req.body, changedBy);
    res.json(updatedContact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Delete a contact by ID
async function deleteContact(req, res) {
  const id = parseInt(req.params.id, 10);
  // Validation for id goes here

  try {
    const changedBy = getChangedBy(req);
    const deleted = await contactService.deleteContact(id, changedBy);
    res.json(deleted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get contact details including notes and attachments
async function getContactDetails(req, res) {
  const contactId = parseInt(req.params.id, 10);
  // Validation for contactId goes here

  try {
    const details = await contactService.getContactDetails(contactId);
    if (!details) {
      return res.status(404).json({ error: "Contact not found" });
    }
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAllContacts,
  getAllPersons,
  createContact,
  updateContact,
  deleteContact,
  getContactDetails,
};
