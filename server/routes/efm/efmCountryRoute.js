const express = require('express');
const router = express.Router();
const countriesController = require('../../controllers/efm/efmCountryController');

router.get('/sync', countriesController.syncCountriesController);

module.exports = router;
