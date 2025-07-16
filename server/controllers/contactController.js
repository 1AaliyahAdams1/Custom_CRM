const contactService = require("../services/contactService");

// Helper to get changedBy (only from authenticated user)
function getChangedBy(req) {
  return req.user?.username || "UnknownUser";
}

function validateContactInput(data, isEdit = false) {
  const errors = [];

  // Validation for required fields and formats goes here

  return errors;
}



async function getContacts(req, res) {
  try {
    // Validation (if any) could go here

    const contacts = await contactService.getAllContacts();
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}



async function getPersons(req, res) {
  try {
    // Validation (if any) could go here

    const persons = await contactService.getAllPersons();
    res.json(persons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}



async function createContact(req, res) {
  // Input validation goes here
  const errors = validateContactInput(req.body, false);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const changedBy = getChangedBy(req);
    const newContact = await contactService.createContact(req.body, changedBy);
    res.status(201).json(newContact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}



async function updateContact(req, res) {
  const id = parseInt(req.params.id, 10);
  // Validation for id format goes here
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid Contact ID" });
  }

  // Input validation goes here
  const errors = validateContactInput(req.body, true);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const changedBy = getChangedBy(req);
    const updatedContact = await contactService.updateContact(id, req.body, changedBy);
    res.json(updatedContact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}



async function deleteContact(req, res) {
  const id = parseInt(req.params.id, 10);
  // Validation for id format goes here
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid Contact ID" });
  }

  try {
    const changedBy = getChangedBy(req);
    const result = await contactService.deleteContact(id, changedBy);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}



async function getContactDetails(req, res) {
  const contactId = parseInt(req.params.id, 10);
  // Validation for id format goes here
  if (isNaN(contactId)) {
    return res.status(400).json({ error: "Invalid Contact ID" });
  }

  try {
    const details = await contactService.getContactDetails(contactId);
    if (!details || details.length === 0) {
      return res.status(404).json({ error: "Contact not found" });
    }
    res.json(details[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getContacts,
  getPersons,
  createContact,
  updateContact,
  deleteContact,
  getContactDetails,
};
