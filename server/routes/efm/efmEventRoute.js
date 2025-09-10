const express = require('express');
const router = express.Router();
const eventsController = require('../../controllers/efm/efmEventController');

router.get('/sync', eventsController.syncEventsController);

module.exports = router;
