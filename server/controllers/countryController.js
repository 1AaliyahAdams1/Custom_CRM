const countryService = require("../services/countryService");

// Get all countries
const getAllCountries = async (req, res) => {
  try {
    const countries = await countryService.getAllCountries();
    res.status(200).json(countries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all active countries
const getAllActiveCountries = async (req, res) => {
  try {
    const countries = await countryService.getAllActiveCountries();
    res.status(200).json(countries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get country by ID
const getCountryById = async (req, res) => {
  try {
    const country = await countryService.getCountryById(req.params.id);
    res.status(200).json(country);
  } catch (error) {
    if (error.message === "Country not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

// Create new country
const createCountry = async (req, res) => {
  try {
    const newCountry = await countryService.createCountry(req.body);
    res.status(201).json(newCountry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update country
const updateCountry = async (req, res) => {
  try {
    const updatedCountry = await countryService.updateCountry(req.params.id, req.body);
    res.status(200).json(updatedCountry);
  } catch (error) {
    if (error.message === "Country not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(400).json({ message: error.message });
  }
};

// Deactivate country (soft delete)
const deactivateCountry = async (req, res) => {
  try {
    const result = await countryService.deactivateCountry(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    if (error.message === "Country not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(400).json({ message: error.message });
  }
};

// Reactivate country
const reactivateCountry = async (req, res) => {
  try {
    const result = await countryService.reactivateCountry(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    if (error.message === "Country not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(400).json({ message: error.message });
  }
};

// Hard delete country
const hardDeleteCountry = async (req, res) => {
  try {
    const result = await countryService.hardDeleteCountry(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    if (error.message === "Country not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(400).json({ message: error.message });
  }
};

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