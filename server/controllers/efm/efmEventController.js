const eventsService = require('../../services/efm/efmEventService');

const syncEventsController = async (req, res) => {
    try {
        const result = await eventsService.syncEvents();
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { syncEventsController };
