const dealStageRepository = require("../data/dealStageRepository");

async function getAllDealStages() {
  // Business logic: filtering, permission checks, or caching can be added here
  return await dealStageRepository.getAllDealStages();
}

module.exports = {
  getAllDealStages,
};
