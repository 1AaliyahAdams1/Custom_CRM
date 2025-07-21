const cityService = require("../services/cityService");

// Get all cities
async function getAllCities(req, res) {
  try {
    // Validation can go here (e.g., query params)
    const cities = await cityService.getAllCities();
    res.json(cities);
  } catch (err) {
    console.error("City Controller Error [getAllCities]:", err);
    res.status(500).json({ error: err.message });
  }
}

// Get city by ID
async function getCityById(req, res) {
  const cityId = parseInt(req.params.id, 10);
  // Validation for cityId can go here

  try {
    const city = await cityService.getCityById(cityId);
    if (!city) {
      return res.status(404).json({ error: "City not found" });
    }
    res.json(city);
  } catch (err) {
    console.error("City Controller Error [getCityById]:", err);
    res.status(500).json({ error: err.message });
  }
}

// Create a new city
async function createCity(req, res) {
  // Validation for req.body can go here

  try {
    const newCity = await cityService.createCity(req.body);
    res.status(201).json(newCity);
  } catch (err) {
    console.error("City Controller Error [createCity]:", err);
    res.status(500).json({ error: err.message });
  }
}

// Update city by ID
async function updateCity(req, res) {
  const cityId = parseInt(req.params.id, 10);
  // Validation for cityId and req.body can go here

  try {
    const updatedCity = await cityService.updateCity(cityId, req.body);
    res.json(updatedCity);
  } catch (err) {
    console.error("City Controller Error [updateCity]:", err);
    res.status(500).json({ error: err.message });
  }
}

// Delete city by ID
async function deleteCity(req, res) {
  const cityId = parseInt(req.params.id, 10);
  // Validation for cityId can go here

  try {
    const deleted = await cityService.deleteCity(cityId);
    res.json(deleted);
  } catch (err) {
    console.error("City Controller Error [deleteCity]:", err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAllCities,
  getCityById,
  createCity,
  updateCity,
  deleteCity,
};
