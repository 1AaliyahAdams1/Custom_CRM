const cityService = require("../services/cityService");

const getAllCities = async (req, res) => {
  try {
    const cities = await cityService.getAllCities();
    res.status(200).json(cities);
  } catch (err) {
    console.error("Error getting all cities:", err);
    res.status(500).json({ error: "Failed to get cities" });
  }
};

const getCityById = async (req, res) => {
  try {
    const city = await cityService.getCityById(req.params.id);
    res.status(200).json(city);
  } catch (err) {
    console.error("Error getting city by ID:", err);
    res.status(500).json({ error: "Failed to get city" });
  }
};

const createCity = async (req, res) => {
  try {
    await cityService.createCity(req.body);
    res.status(201).json({ message: "City created successfully" });
  } catch (err) {
    console.error("Error creating city:", err);
    res.status(500).json({ error: "Failed to create city" });
  }
};

const updateCity = async (req, res) => {
  try {
    await cityService.updateCity(req.params.id, req.body);
    res.status(200).json({ message: "City updated successfully" });
  } catch (err) {
    console.error("Error updating city:", err);
    res.status(500).json({ error: "Failed to update city" });
  }
};

const deactivateCity = async (req, res) => {
  try {
    await cityService.deactivateCity(req.params.id);
    res.status(200).json({ message: "City deactivated successfully" });
  } catch (err) {
    console.error("Error deactivating city:", err);
    res.status(500).json({ error: "Failed to deactivate city" });
  }
};

const reactivateCity = async (req, res) => {
  try {
    await cityService.reactivateCity(req.params.id);
    res.status(200).json({ message: "City reactivated successfully" });
  } catch (err) {
    console.error("Error reactivating city:", err);
    res.status(500).json({ error: "Failed to reactivate city" });
  }
};

const deleteCity = async (req, res) => {
  try {
    await cityService.deleteCity(req.params.id);
    res.status(200).json({ message: "City deleted successfully" });
  } catch (err) {
    console.error("Error deleting city:", err);
    res.status(500).json({ error: "Failed to delete city" });
  }
};

module.exports = {
  getAllCities,
  getCityById,
  createCity,
  updateCity,
  deactivateCity,
  reactivateCity,
  deleteCity,
};
