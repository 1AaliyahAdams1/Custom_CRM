const express = require('express');
const router = express.Router();
const companiesController = require('../../controllers/efm/efmCompanyController');

router.get('/sync', companiesController.syncCompaniesController);

module.exports = router;
