const companiesService = require('../../services/efm/efmCompanyService');

const syncCompaniesController = async (req, res) => {
    try {
        const result = await companiesService.syncCompanies();
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { syncCompaniesController };
