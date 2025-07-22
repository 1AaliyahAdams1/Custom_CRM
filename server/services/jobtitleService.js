const jobTitleRepository = require("../data/jobtitleRepository");

// Helper to get changedBy or default value
function getChangedByOrDefault(changedBy) {
  return changedBy || "System";
}

async function getAllJobTitles(activeOnly = false) {
  // Business logic: filtering by activeOnly, caching, permissions can go here
  return await jobTitleRepository.getAllJobTitles(activeOnly);
}

async function getJobTitleById(jobTitleId) {
  // Business logic: validate jobTitleId, permissions checks
  return await jobTitleRepository.getJobTitleById(jobTitleId);
}

async function createJobTitle(jobTitleName, active = true, changedBy) {
  const user = getChangedByOrDefault(changedBy);

  // Business logic: validate jobTitleName, enforce uniqueness, sanitize input

  return await jobTitleRepository.createJobTitle(jobTitleName, active);
}

async function updateJobTitle(jobTitleId, data, changedBy) {
  const user = getChangedByOrDefault(changedBy);

  // Business logic: validate jobTitleId, validate data, permissions

  await jobTitleRepository.updateJobTitle(jobTitleId, data);
  return { message: "Job title updated successfully", JobTitleID: jobTitleId };
}

async function deleteJobTitle(jobTitleId, changedBy) {
  const user = getChangedByOrDefault(changedBy);

  // Business logic: check if job title can be safely deactivated

  await jobTitleRepository.deleteJobTitle(jobTitleId);
  return { message: "Job title marked as inactive", JobTitleID: jobTitleId };
}

module.exports = {
  getAllJobTitles,
  getJobTitleById,
  createJobTitle,
  updateJobTitle,
  deleteJobTitle,
};
