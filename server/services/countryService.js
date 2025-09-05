const countryRepo = require("../data/countryRepository");

// Hardcoded userId for now (same as account service)
const userId = 1;

// Get all countries
async function getAllCountries() {
  return await countryRepo.getAllCountries();
}

// Get all active countries
async function getAllActiveCountries() {
  return await countryRepo.getAllActiveCountries();
}

// Get country by ID
async function getCountryById(id) {
  const country = await countryRepo.getCountryById(id);
  if (!country) {
    throw new Error("Country not found");
  }
  return country;
}

// Create new country
async function createCountry(data) {
  return await countryRepo.createCountry(data);
}

// Update country
async function updateCountry(id, data) {
  // First check if country exists
  const existingCountry = await countryRepo.getCountryById(id);
  if (!existingCountry) {
    throw new Error("Country not found");
  }
  return await countryRepo.updateCountry(id, data);
}

// Deactivate country (soft delete)
async function deactivateCountry(id) {
  // First check if country exists
  const country = await countryRepo.getCountryById(id);
  if (!country) {
    throw new Error("Country not found");
  }

  if (!country.Active) {
    throw new Error("Country is already deactivated");
  }

  return await countryRepo.deleteCountry(id);
}

// Reactivate country
async function reactivateCountry(id) {
  // First check if country exists
  const country = await countryRepo.getCountryById(id);
  if (!country) {
    throw new Error("Country not found");
  }

  if (country.Active) {
    throw new Error("Country is already active");
  }

  return await countryRepo.reactivateCountry(id);
}

// Hard delete country
async function hardDeleteCountry(id) {
  // First check if country exists
  const country = await countryRepo.getCountryById(id);
  if (!country) {
    throw new Error("Country not found");
  }

  // Optional: Check if country is deactivated first
  if (country.Active) {
    throw new Error("Country must be deactivated before permanent deletion");
  }

  return await countryRepo.hardDeleteCountry(id);
}

module.exports = {
  getAllCountries,
  getAllActiveCountries,
  getCountryById,
  createCountry,
  updateCountry,
  deactivateCountry,
  reactivateCountry,
  hardDeleteCountry
};