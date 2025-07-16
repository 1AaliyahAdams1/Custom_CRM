const contactRepository = require("../data/contactRepository");

// Helper to get changedBy, default to "System" if not passed
function getChangedByOrDefault(changedBy) {
  return changedBy || "System";
}

async function getAllContacts() {
  // Business logic like filtering, paging, or permission checks can go here
  return await contactRepository.getAllContacts();
}

async function getAllPersons() {
  // Business logic related to persons can be added here
  return await contactRepository.getAllPersons();
}

async function createContact(contactData, changedBy) {
  const user = getChangedByOrDefault(changedBy);

  let personId = contactData.PersonID;

  // Business logic: decide whether to create new person or use existing
  if (contactData.isNewPerson) {
    // Validation should be done in controller or middleware

    // Create new person
    personId = await contactRepository.createPerson({
      PersonName: contactData.PersonName,
      CityID: contactData.PersonCityID
    });
  } else {
    // Business logic: use existing personId, validation should ensure it's present
    personId = personId;
  }

  // Business logic: prepare contact data before creation
  const contactToCreate = {
    AccountID: contactData.AccountID,
    PersonID: personId,
    PrimaryEmail: contactData.PrimaryEmail,
    PrimaryPhone: contactData.PrimaryPhone,
    Position: contactData.Position,
  };

  // Call repo to create contact
  const newContact = await contactRepository.createContact(contactToCreate, user);
  return newContact;
}

async function updateContact(id, contactData, changedBy) {
  const user = getChangedByOrDefault(changedBy);

  let personId = contactData.PersonID;

  // Business logic: decide to create or update person, validation should be outside
  if (contactData.isNewPerson) {
    // Create new person and assign id
    personId = await contactRepository.createPerson({
      PersonName: contactData.PersonName,
      CityID: contactData.PersonCityID
    });
  } else if (contactData.PersonID && contactData.PersonName) {
    // Update existing person data
    await contactRepository.updatePerson(contactData.PersonID, {
      PersonName: contactData.PersonName,
      CityID: contactData.PersonCityID
    });
  }

  // Business logic: prepare updated contact data
  const contactToUpdate = {
    AccountID: contactData.AccountID,
    PersonID: personId,
    PrimaryEmail: contactData.PrimaryEmail,
    PrimaryPhone: contactData.PrimaryPhone,
    Position: contactData.Position,
  };

  // Call repo to update contact
  return await contactRepository.updateContact(id, contactToUpdate, user);
}

async function deleteContact(id, changedBy) {
  const user = getChangedByOrDefault(changedBy);
  // Business logic: add checks for deletion or archiving if needed
  return await contactRepository.deleteContact(id, user);
}

async function getContactDetails(contactId) {
  return await contactRepository.getContactDetails(contactId);
}

module.exports = {
  getAllContacts,
  getAllPersons,
  createContact,
  updateContact,
  deleteContact,
  getContactDetails,
};
