const contactRepository = require("../data/contactRepository");
const personRepository = require("../data/personRepository");
const noteRepository = require("../data/noteRepository");
const attachmentRepository = require("../data/attachmentRepository");

// Helper to get changedBy, default to "System" if not passed
function getChangedByOrDefault(changedBy) {
  return changedBy || "System";
}

async function getAllContacts() {
  // Business logic: filtering, paging, user permissions
  return await contactRepository.getAllContacts();
}

async function getAllPersons() {
  // Business logic: apply filters or permissions
  return await personRepository.getAllPersons();
}

async function createContact(contactData, changedBy) {
  const user = getChangedByOrDefault(changedBy);

  let personId = contactData.PersonID;

  // Business logic: decide whether to create or use existing person
  if (contactData.isNewPerson) {
    const newPerson = {
      PersonName: contactData.PersonName,
      CityID: contactData.PersonCityID,
    };

    personId = await personRepository.createPerson(newPerson);
  } else {
    // Business logic: assume existing PersonID is valid
  }

  // Business logic: enrich or validate contact data
  const contactToCreate = {
    AccountID: contactData.AccountID,
    PersonID: personId,
    PrimaryEmail: contactData.PrimaryEmail,
    PrimaryPhone: contactData.PrimaryPhone,
    Position: contactData.Position,
  };

  return await contactRepository.createContact(contactToCreate, user);
}

async function updateContact(id, contactData, changedBy) {
  const user = getChangedByOrDefault(changedBy);

  let personId = contactData.PersonID;

  // Business logic: create or update person
  if (contactData.isNewPerson) {
    const newPerson = {
      PersonName: contactData.PersonName,
      CityID: contactData.PersonCityID,
    };

    personId = await personRepository.createPerson(newPerson);
  } else if (contactData.PersonID && contactData.PersonName) {
    const updatedPerson = {
      PersonName: contactData.PersonName,
      CityID: contactData.PersonCityID,
    };

    await personRepository.updatePerson(contactData.PersonID, updatedPerson);
  }

  const contactToUpdate = {
    AccountID: contactData.AccountID,
    PersonID: personId,
    PrimaryEmail: contactData.PrimaryEmail,
    PrimaryPhone: contactData.PrimaryPhone,
    Position: contactData.Position,
  };

  return await contactRepository.updateContact(id, contactToUpdate, user);
}

async function deleteContact(id, changedBy) {
  const user = getChangedByOrDefault(changedBy);
  // Business logic: check for soft deletion, linked data, permissions
  return await contactRepository.deleteContact(id, user);
}

async function getContactDetails(contactId) {
  // Business logic: permission check or enrichment
  const contact = await contactRepository.getContactDetails(contactId);

  // Business logic: optionally filter or mask notes/attachments based on user role
  const notes = await noteRepository.getNotes(contactId, "Contact");
  const attachments = await attachmentRepository.getAttachments(contactId, "Contact");
  const persons = await personRepository.getPersonById(contactId);

  return {
    ...contact,
    notes,
    attachments,
    persons
  };
}


module.exports = {
  getAllContacts,
  getAllPersons,
  createContact,
  updateContact,
  deleteContact,
  getContactDetails
};
