const dealStageService = require("../services/dealStageService");

async function getAllDealStages(req, res) {
  const dealStages = await dealStageService.getAllDealStages();
  res.json(dealStages);
}

async function getDealStageById(req, res) {
  const dealStage = await dealStageService.getDealStageById(parseInt(req.params.id));
  res.json(dealStage);
}

async function createDealStage(req, res) {
  const newDealStage = await dealStageService.createDealStage(req.body);
  res.status(201).json(newDealStage);
}

async function updateDealStage(req, res) {
  const updatedDealStage = await dealStageService.updateDealStage(parseInt(req.params.id), req.body);
  res.json(updatedDealStage);
}

async function deactivateDealStage(req, res) {
  const result = await dealStageService.deactivateDealStage(parseInt(req.params.id));
  res.json(result);
}

async function reactivateDealStage(req, res) {
  const result = await dealStageService.reactivateDealStage(parseInt(req.params.id));
  res.json(result);
}

async function deleteDealStage(req, res) {
  const result = await dealStageService.deleteDealStage(parseInt(req.params.id));
  res.json(result);
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
