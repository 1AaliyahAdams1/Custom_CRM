const cityService = require("../services/cityService");

async function getCities(req, res) {
  try {

    // Validation goes here (if needed)

    const cities = await cityService.getAllCities();
    res.json(cities);
  } catch (err) {
    console.error("City Controller Error:", err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getCities,
};
