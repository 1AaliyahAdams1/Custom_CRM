const industryRepository = require("../data/industryRepository");

// Helper to get changedBy or default value
function getChangedByOrDefault(changedBy) {
  return changedBy || "System";
}

async function getAllIndustries(activeOnly = false) {
  // Business logic: filter by activeOnly flag, caching, permissions, etc. can go here
  return await industryRepository.getAllIndustries(activeOnly);
}

async function getIndustryById(industryId) {
  // Business logic: validate industryId, permissions checks, etc.
  return await industryRepository.getIndustryById(industryId);
}

async function createIndustry(industryName, active = true, changedBy) {
  const user = getChangedByOrDefault(changedBy);

  // Business logic: validate industryName, enforce uniqueness, sanitize input

  // Call repo to create industry
  return await industryRepository.createIndustry(industryName, active);
}

async function updateIndustry(industryId, data, changedBy) {
  const user = getChangedByOrDefault(changedBy);
  
  // Business logic: validate industryId, validate input data, permission checks

  await industryRepository.updateIndustry(industryId, data);
  
  return { message: "Industry updated successfully", IndustryID: industryId };
}

async function deleteIndustry(industryId, changedBy) {
  const user = getChangedByOrDefault(changedBy);
  
  // Business logic: check if industry can be deleted, soft delete logic

  await industryRepository.deleteIndustry(industryId);
  
  return { message: "Industry marked as inactive", IndustryID: industryId };
}

module.exports = {
  getAllIndustries,
  getIndustryById,
  createIndustry,
  updateIndustry,
  deleteIndustry,
};
