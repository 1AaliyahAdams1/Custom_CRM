const citiesService = require('../../services/efm/efmCityService');

const syncCitiesController = async (req, res) => {
    try {
        const result = await citiesService.syncCities();
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { syncCitiesController };
