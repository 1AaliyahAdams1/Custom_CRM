const priorityLevelRepository = require("../data/priorityLevelRepository");

// Helper to get changedBy or default user if needed in the future
function getChangedByOrDefault(changedBy) {
  return changedBy || "System";
}

async function getAllPriorityLevels() {
  // Business logic: filtering, sorting enhancements, caching, permission checks can go here
  return await priorityLevelRepository.getAllPriorityLevels();
}

async function getPriorityLevelById(id) {
  // Business logic: validate id, permission checks
  return await priorityLevelRepository.getPriorityLevelById(id);
}

async function createPriorityLevel(data, changedBy) {
  const user = getChangedByOrDefault(changedBy);

  // Business logic: validate data.PriorityLevelName, data.PriorityLevelValue, check duplicates etc.

  return await priorityLevelRepository.createPriorityLevel(data);
}

async function updatePriorityLevel(id, data, changedBy) {
  const user = getChangedByOrDefault(changedBy);

  // Business logic: validate id and data, check permissions, enforce business rules

  const result = await priorityLevelRepository.updatePriorityLevel(id, data);
  return result;
}

async function deletePriorityLevel(id, changedBy) {
  const user = getChangedByOrDefault(changedBy);

  // Business logic: validate id, check dependencies or usage before delete

  const result = await priorityLevelRepository.deletePriorityLevel(id);
  return result;
}

module.exports = {
  getAllPriorityLevels,
  getPriorityLevelById,
  createPriorityLevel,
  updatePriorityLevel,
  deletePriorityLevel,
};
