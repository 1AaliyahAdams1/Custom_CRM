const countriesService = require('../../services/efm/efmCountryService');

const syncCountriesController = async (req, res) => {
    try {
        const result = await countriesService.syncCountries();
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { syncCountriesController };
