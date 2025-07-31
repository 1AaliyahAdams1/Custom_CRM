const dealService = require("../services/dealService");

async function getAllDeals(req, res) {
  const deals = await dealService.getAllDeals();
  res.json(deals);
}

async function getDealById(req, res) {
  const deal = await dealService.getDealById(parseInt(req.params.id));
  res.json(deal);
}

async function createDeal(req, res) {
  const newDeal = await dealService.createDeal(req.body);
  res.status(201).json(newDeal);
}

async function updateDeal(req, res) {
  const updated = await dealService.updateDeal(parseInt(req.params.id), req.body);
  res.json(updated);
}

async function deactivateDeal(req, res) {
  const result = await dealService.deactivateDeal(parseInt(req.params.id), req.body);
  res.json(result);
}

async function reactivateDeal(req, res) {
  const result = await dealService.reactivateDeal(parseInt(req.params.id), req.body);
  res.json(result);
}

async function deleteDeal(req, res) {
  const result = await dealService.deleteDeal(parseInt(req.params.id), req.body);
  res.json(result);
}

module.exports = {
  getAllDeals,
  getDealById,
  createDeal,
  updateDeal,
  deactivateDeal,
  reactivateDeal,
  deleteDeal,
};
