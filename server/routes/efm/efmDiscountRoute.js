const express = require('express');
const router = express.Router();
const discountController = require('../../controllers/efm/efmDiscountController');

router.get('/', discountController.getDiscounts);
router.post('/', discountController.createDiscount);
router.put('/:id', discountController.updateDiscount);

module.exports = router;
