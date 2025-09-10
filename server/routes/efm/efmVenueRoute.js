const express = require('express');
const router = express.Router();
const venuesController = require('../../controllers/efm/efmVenueController');

router.get('/sync', venuesController.syncVenuesController);

module.exports = router;
