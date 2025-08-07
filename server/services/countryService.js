const countryRepo = require("../data/countryRepository");

// Get all country
async function getAllCountries() {
  return await countryRepo.getAllCountries();
}

module.exports = {
  getAllCountries
};