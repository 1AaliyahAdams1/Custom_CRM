const stateRepository = require("../data/stateProvinceRepository");

// Helper to get changedBy or default user
function getChangedByOrDefault(changedBy) {
  return changedBy || "System";
}

async function getAllStates() {
  // Business logic: filtering, caching, permission checks could go here
  return await stateRepository.getAllStates();
}

async function getStateById(id) {
  // Business logic: validate id, permissions checks
  return await stateRepository.getStateById(id);
}

async function createState(stateData, changedBy) {
  const user = getChangedByOrDefault(changedBy);

  // Business logic: validate stateData (name, countryId), check duplicates

  return await stateRepository.createState(stateData);
}

async function updateState(id, stateData, changedBy) {
  const user = getChangedByOrDefault(changedBy);

  // Business logic: validate id and stateData, permission checks

  const result = await stateRepository.updateState(id, stateData);
  return result;
}

async function deleteState(id, changedBy) {
  const user = getChangedByOrDefault(changedBy);

  // Business logic: validate id, check dependencies before delete

  const result = await stateRepository.deleteState(id);
  return result;
}

module.exports = {
  getAllStates,
  getStateById,
  createState,
  updateState,
  deleteState,
};
