const countryService = require("../services/countryService");

const getAllCountries = async (req, res) => {
  try {
    const countries = await countryService.getAllCountries();
    res.status(200).json(countries);
  } catch (err) {
    console.error("Error getting all countries:", err);
    res.status(500).json({ error: "Failed to get countries" });
  }
};

module.exports = {
  getAllCountries
};