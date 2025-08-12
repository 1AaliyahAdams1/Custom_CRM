const jobTitleRepo = require("../data/jobTitleRepository");

async function getAllJobTitles() {
  return await jobTitleRepo.getAllJobTitles();
}

async function getJobTitleById(id) {
  return await jobTitleRepo.getJobTitleById(id);
}

async function createJobTitle(name) {
  return await jobTitleRepo.createJobTitle(name);
}

async function updateJobTitle(id, name) {
  return await jobTitleRepo.updateJobTitle(id, name);
}

async function deactivateJobTitle(id) {
  return await jobTitleRepo.deactivateJobTitle(id);
}

async function reactivateJobTitle(id) {
  return await jobTitleRepo.reactivateJobTitle(id);
}

async function deleteJobTitle(id) {
  return await jobTitleRepo.deleteJobTitle(id);
}

module.exports = {
  getAllJobTitles,
  getJobTitleById,
  createJobTitle,
  updateJobTitle,
  deactivateJobTitle,
  reactivateJobTitle,
  deleteJobTitle,
};
