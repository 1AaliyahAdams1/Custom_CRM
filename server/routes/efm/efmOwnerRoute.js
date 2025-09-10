const express = require('express');
const router = express.Router();
const ownersController = require('../../controllers/efm/efmOwnerController');

router.get('/sync/:companyID', ownersController.syncOwnersController);

module.exports = router;
