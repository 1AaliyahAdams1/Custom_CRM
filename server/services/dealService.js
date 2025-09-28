const dealRepo = require("../data/dealRepository");

async function getAllDeals() {
  return await dealRepo.getAllDeals();
}

async function getDealById(id) {
  return await dealRepo.getDealById(id);
}

async function createDeal(data, changedBy = 1) {
  return await dealRepo.createDeal(data, changedBy);
}

async function updateDeal(id, data, changedBy = 1) {
  return await dealRepo.updateDeal(id, data, changedBy);
}

async function deactivateDeal(id, data, changedBy = 1) {
  return await dealRepo.deactivateDeal(id, data, changedBy);
}

async function reactivateDeal(id, data, changedBy = 1) {
  return await dealRepo.reactivateDeal(id, data, changedBy);
}

async function deleteDeal(id, data, changedBy = 1) {
  return await dealRepo.deleteDeal(id, data, changedBy);
}

async function getDealsByUser(userId) {
  return await dealRepo.getDealsByUser(userId);
}
async function getDealsByAccountID(accountId) {
  return await dealRepo.getDealsByAccountID(accountId);
}

module.exports = {
  getAllDeals,
  getDealById,
  createDeal,
  updateDeal,
  deactivateDeal,
  reactivateDeal,
  deleteDeal,
  getDealsByUser,
  getDealsByAccountID
};
