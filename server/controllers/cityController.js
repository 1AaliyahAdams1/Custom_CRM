const cityService = require("../services/cityService");

const getAllCities = async (req, res) => {
  try {
    const cities = await cityService.getAllCities();
    res.status(200).json(cities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCityById = async (req, res) => {
  try {
    const city = await cityService.getCityById(req.params.id);
    if (!city) return res.status(404).json({ error: "City not found" });
    res.status(200).json(city);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createCity = async (req, res) => {
  try {
    await cityService.createCity(req.body);
    res.status(201).json({ message: "City created successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const updateCity = async (req, res) => {
  try {
    await cityService.updateCity(req.params.id, req.body);
    res.status(200).json({ message: "City updated successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deactivateCity = async (req, res) => {
  try {
    await cityService.deactivateCity(req.params.id);
    res.status(200).json({ message: "City deactivated successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const reactivateCity = async (req, res) => {
  try {
    await cityService.reactivateCity(req.params.id);
    res.status(200).json({ message: "City reactivated successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteCity = async (req, res) => {
  try {
    await cityService.deleteCity(req.params.id);
    res.status(200).json({ message: "City deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
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
