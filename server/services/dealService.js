const dealRepository = require("../data/dealRepository");

// Helper to get changedBy, default to "System"
function getChangedByOrDefault(changedBy) {
  return changedBy || "System";
}

async function getAllDeals() {
  // Business logic like filtering, sorting, pagination, permissions can be added here
  return await dealRepository.getAllDeals();
}

async function createDeal(dealData, changedBy) {
  const user = getChangedByOrDefault(changedBy);

  // Business logic: validate dealData, apply defaults, enrich data etc.

  return await dealRepository.createDeal(dealData, user);
}

async function updateDeal(id, dealData, changedBy) {
  const user = getChangedByOrDefault(changedBy);

  // Business logic: check if deal exists, validate changes, permission checks

  return await dealRepository.updateDeal(id, dealData, user);
}

async function deleteDeal(id, changedBy) {
  const user = getChangedByOrDefault(changedBy);

  // Business logic: check if deal can be deleted, cascade deletes or archiving

  return await dealRepository.deleteDeal(id, user);
}

async function getDealDetails(dealId) {
  // Business logic: enrich data, check permissions

  const dealDetails = await dealRepository.getDealDetails(dealId);
  return dealDetails; 
}

module.exports = {
  getAllDeals,
  createDeal,
  updateDeal,
  deleteDeal,
  getDealDetails,
};
