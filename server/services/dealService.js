const dealRepository = require("../data/dealRepository");
const noteRepository = require("../data/noteRepository");
const attachmentRepository = require("../data/attachmentRepository");
const dealProductRepository = require("../data/dealProductRepository");

// Helper to get changedBy, default to "System"
function getChangedByOrDefault(changedBy) {
  return changedBy || "System";
}

async function getAllDeals() {
  // Business logic: filtering, sorting, pagination, permission checks
  return await dealRepository.getAllDeals();
}

async function createDeal(dealData, changedBy) {
  const user = getChangedByOrDefault(changedBy);

  // Business logic: validate required fields, apply default values, enrich or transform dealData
  return await dealRepository.createDeal(dealData, user);
}

async function updateDeal(id, dealData, changedBy) {
  const user = getChangedByOrDefault(changedBy);

  // Business logic: verify deal exists, validate fields, enforce permissions
  return await dealRepository.updateDeal(id, dealData, user);
}

async function deleteDeal(id, changedBy) {
  const user = getChangedByOrDefault(changedBy);

  // Business logic: prevent deletion if restricted, handle cascade deletes or archiving
  return await dealRepository.deleteDeal(id, user);
}

async function getDealDetails(dealId) {
  // Business logic: enrich details with related data, enforce read permissions

  const deal = await dealRepository.getDealDetails(dealId);

  // Fetch related products (many-to-many)
  const products = await dealProductRepository.getProductsByDealId(dealId);

  // Fetch related notes
  const notes = await noteRepository.getNotes(dealId, "Deal");

  // Fetch related attachments
  const attachments = await attachmentRepository.getAttachments(dealId, "Deal");

  return {
    ...deal,
    products,
    notes,
    attachments
  };
}

module.exports = {
  getAllDeals,
  createDeal,
  updateDeal,
  deleteDeal,
  getDealDetails,
};
