const express = require('express');
const router = express.Router();
const citiesController = require('../../controllers/efm/efmCityController');

router.get('/sync', citiesController.syncCitiesController);

module.exports = router;
