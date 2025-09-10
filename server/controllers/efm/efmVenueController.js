const venuesService = require('../../services/efm/efmVenueService');

const syncVenuesController = async (req, res) => {
    try {
        const result = await venuesService.syncVenues();
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    syncVenuesController
};
