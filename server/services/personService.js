const personRepo = require("../data/personRepository");

// Hardcoded userId for now
const userId = 1;

async function getAllPersons() {
  return await personRepo.getAllPersons();
}

async function getPersonById(id) {
  return await personRepo.getPersonById(id);
}

async function createPerson(data) {
  return await personRepo.createPerson(data, userId);
}

async function updatePerson(id, data) {
  return await personRepo.updatePerson(id, data, userId);
}

async function deactivatePerson(id) {
  const person = await personRepo.getPersonById(id);
  if (!person) {
    throw new Error("Person not found");
  }

  if (!person.Active) {
    throw new Error("Person is already deactivated");
  }

  person.Active = false;

  return await personRepo.deactivatePerson(person, userId, 7);
}

async function reactivatePerson(id) {
  return await personRepo.reactivatePerson(id, userId);
}

async function deletePerson(id) {
  return await personRepo.deletePerson(id, userId);
}

module.exports = {
  getAllPersons,
  getPersonById,
  createPerson,
  updatePerson,
  deactivatePerson,
  reactivatePerson,
  deletePerson,
};
