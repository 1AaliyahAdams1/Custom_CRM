const express = require('express');
const router = express.Router();
const personController = require('../controllers/personController');


router.get('/', personController.getAllPersons);
router.get('/:id', personController.getPersonById);
router.post('/', personController.createPerson);
router.put('/:id', personController.updatePerson);
router.patch('/:id/deactivate', personController.deactivatePerson);
router.patch('/:id/reactivate', personController.reactivatePerson);
router.delete('/:id/delete', personController.deletePerson);

module.exports = router;
