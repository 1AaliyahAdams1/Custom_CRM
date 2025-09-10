const discountService = require('../../services/efm/efmDiscountService');

// GET all discount codes (sync first)
async function getDiscounts(req, res) {
    try {
        const result = await discountService.syncDiscounts();
        res.status(200).json({ success: true, message: result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

// POST - create a new discount code via API
async function createDiscount(req, res) {
    try {
        const { discountCode, discountPercentage, companyID, minEvents, maxEvents, validUntil, createdBy, oneTime, minCommitted, requestReview } = req.body;

        const discount = {
            discountCodeID: null, // API will assign
            discountCode,
            discountPercentage,
            companyID,
            minEvents,
            maxEvents,
            validUntil,
            createdBy,
            oneTime,
            minCommitted,
            requestReview
        };

        const result = await discountService.createDiscount(discount);
        res.status(201).json({ success: true, data: result, message: 'Discount created' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

// PUT - update discount code
async function updateDiscount(req, res) {
    try {
        const discountID = req.params.id;
        const payload = req.body;

        const result = await discountService.updateDiscount(discountID, payload);
        res.status(200).json({ success: true, data: result, message: 'Discount updated' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

module.exports = { getDiscounts, createDiscount, updateDiscount };
