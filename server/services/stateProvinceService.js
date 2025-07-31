const stateRepo = require("../data/stateProvinceRepository");

async function getAllStates() {
  return await stateRepo.getAllStates();
}

async function getStateById(id) {
  return await stateRepo.getStateById(id);
}

async function getIDByStateProvince(name) {
  return await stateRepo.getIDByStateProvince(name);
}

async function createState(data) {
  return await stateRepo.createState(data);
}

async function updateState(id, data) {
  return await stateRepo.updateState(id, data);
}

async function deactivateState(id) {
  return await stateRepo.deactivateState(id);
}

async function reactivateState(id) {
  return await stateRepo.reactivateState(id);
}

async function deleteState(id) {
  return await stateRepo.deleteState(id);
}

module.exports = {
  getAllStates,
  getStateById,
  getIDByStateProvince,
  createState,
  updateState,
  deactivateState,
  reactivateState,
  deleteState,
};
