const priorityLevelRepo = require("../data/priorityLevelRepository");

async function getAllPriorityLevels() {
  return await priorityLevelRepo.getAllPriorityLevels();
}

async function getPriorityLevelById(id) {
  return await priorityLevelRepo.getPriorityLevelById(id);
}

async function createPriorityLevel(data) {
  return await priorityLevelRepo.createPriorityLevel(data);
}

async function updatePriorityLevel(id, data) {
  return await priorityLevelRepo.updatePriorityLevel(id, data);
}

async function deactivatePriorityLevel(id) {
  return await priorityLevelRepo.deactivatePriorityLevel(id);
}

async function reactivatePriorityLevel(id) {
  return await priorityLevelRepo.reactivatePriorityLevel(id);
}

async function deletePriorityLevel(id) {
  return await priorityLevelRepo.deletePriorityLevel(id);
}

module.exports = {
  getAllPriorityLevels,
  getPriorityLevelById,
  createPriorityLevel,
  updatePriorityLevel,
  deactivatePriorityLevel,
  reactivatePriorityLevel,
  deletePriorityLevel,
};
