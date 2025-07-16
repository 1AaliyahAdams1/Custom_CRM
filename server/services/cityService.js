const cityRepository = require("../data/cityRepository");

async function getAllCities() {
  // Business logic like filtering or caching can be added here
  return await cityRepository.getAllCities();
}

module.exports = {
  getAllCities,
};
