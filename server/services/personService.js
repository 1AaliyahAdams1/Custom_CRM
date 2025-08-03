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
  const account = await personRepo.getPersonById(id);
  if (!account) {
    throw new Error("Account not found");
  }

  if (!account.Active) {
    throw new Error("Account is already deactivated");
  }

  account.Active = false;

  return await personRepo.deactivatePerson(account, userId, 7);
}

// Reactivate an account
async function reactivatePerson(id) {
  return await personRepo.reactivatePerson(id, userId);
}

// Hard delete an account
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
