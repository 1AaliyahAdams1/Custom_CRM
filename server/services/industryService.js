const industryRepo = require("../data/industryRepository");

async function getAllIndustries() {
  return await industryRepo.getAllIndustries();
}

async function getIndustryById(id) {
  return await industryRepo.getIndustryById(id);
}

async function createIndustry(name) {
  return await industryRepo.createIndustry(name);
}

async function updateIndustry(id, name) {
  return await industryRepo.updateIndustry(id, name);
}

async function deactivateIndustry(id) {
  return await industryRepo.deactivateIndustry(id);
}

async function reactivateIndustry(id) {
  return await industryRepo.reactivateIndustry(id);
}

async function deleteIndustry(id) {
  return await industryRepo.deleteIndustry(id);
}

module.exports = {
  getAllIndustries,
  getIndustryById,
  createIndustry,
  updateIndustry,
  deactivateIndustry,
  reactivateIndustry,
  deleteIndustry,
};
