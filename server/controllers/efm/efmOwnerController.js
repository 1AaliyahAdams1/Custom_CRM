const ownersService = require('../../services/efm/efmOwnerService');

const syncOwnersController = async (req, res) => {
    try {
        const { companyID } = req.params;
        const result = await ownersService.syncOwners(companyID);
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { syncOwnersController };
