const cityRepository = require("../data/cityRepository");

async function getAllCities() {
  // Business logic: e.g., apply filters, access checks, caching
  return await cityRepository.getAllCities();
}

async function getCityById(cityId) {
  // Business logic: e.g., validate cityId, check permissions
  return await cityRepository.getCityById(cityId);
}

async function createCity(cityData) {
  // Business logic: validate cityData (e.g., required fields, duplicates)
  return await cityRepository.createCity(cityData);
}

async function updateCity(cityId, cityData) {
  // Business logic: validate cityId and cityData, check if city exists, check for changes
  return await cityRepository.updateCity(cityId, cityData);
}

async function deleteCity(cityId) {
  // Business logic: validate cityId, check if city is in use before deleting
  return await cityRepository.deleteCity(cityId);
}

module.exports = {
  getAllCities,
  getCityById,
  createCity,
  updateCity,
  deleteCity,
};
