const dealStageRepo = require("../data/dealStageRepository");

async function getAllDealStages() {
  return await dealStageRepo.getAllDealStages();
}

async function getDealStageById(id) {
  return await dealStageRepo.getDealStageById(id);
}

async function createDealStage(data) {
  return await dealStageRepo.createDealStage(data);
}

async function updateDealStage(id, data) {
  return await dealStageRepo.updateDealStage(id, data);
}

async function deactivateDealStage(id) {
  return await dealStageRepo.deactivateDealStage(id);
}

async function reactivateDealStage(id) {
  return await dealStageRepo.reactivateDealStage(id);
}

async function deleteDealStage(id) {
  return await dealStageRepo.deleteDealStage(id);
}

module.exports = {
  getAllDealStages,
  getDealStageById,
  createDealStage,
  updateDealStage,
  deactivateDealStage,
  reactivateDealStage,
  deleteDealStage,
};
