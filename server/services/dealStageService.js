const dealStageRepository = require("../data/dealStageRepository");

async function getAllDealStages() {
  // Business logic like filtering, permissions, or caching could go here
  return await dealStageRepository.getAllDealStages();
}

module.exports = {
  getAllDealStages,
};
