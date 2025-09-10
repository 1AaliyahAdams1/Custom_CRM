// service/efm/efmDiscountService.js
const axios = require('axios');
const discountData = require('../../data/efm/efmDiscountRepository');
const efmConfig = require('../../efmConfig'); 

// Fetch discount codes for a company (paginated)
const fetchDiscountsFromEFM = async (companyID, page = 1, pageSize = 50) => {
    try {
        const url = `${efmConfig.baseURL}/discount-codes/by-company/${companyID}?page=${page}&pageSize=${pageSize}&apikey=${efmConfig.apiKey}`;
        const res = await axios.get(url);
        return res.data?.data || [];
    } catch (err) {
        console.error(`Error fetching discounts for company ${companyID}:`, err.message);
        return [];
    }
};

// Sync all discounts for a company
const syncDiscounts = async (companyID) => {
    let page = 1;
    let more = true;
    let totalSynced = 0;

    while (more) {
        const discounts = await fetchDiscountsFromEFM(companyID, page);
        
        if (!discounts.length) {
            more = false;
            break;
        }

        for (const discount of discounts) {
            await discountData.insertOrUpdateDiscount(discount);
            totalSynced++;
        }

        page++;
    }

    return { 
        success: true, 
        message: `Discounts for company ${companyID} synced successfully`, 
        totalSynced 
    };
};

// Create a discount
const createDiscount = async (discount) => {
    try {
        const response = await axios.post(
            `${efmConfig.baseURL}/discount-codes?apikey=${efmConfig.apiKey}`,
            discount,
            { headers: { 'Content-Type': 'application/json' } }
        );

        const createdDiscount = response.data?.data;
        if (createdDiscount) {
            await discountData.insertOrUpdateDiscount(createdDiscount);
        }

        return createdDiscount;
    } catch (err) {
        console.error('Error creating discount:', err.message);
        throw new Error(err.response?.data?.message || err.message);
    }
};

// Update a discount
const updateDiscount = async (discountID, payload) => {
    try {
        const response = await axios.put(
            `${efmConfig.baseURL}/discount-codes/${discountID}?apikey=${efmConfig.apiKey}`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );

        const updatedDiscount = response.data?.data;
        if (updatedDiscount) {
            await discountData.insertOrUpdateDiscount(updatedDiscount);
        }

        return updatedDiscount;
    } catch (err) {
        console.error(`Error updating discount ${discountID}:`, err.message);
        throw new Error(err.response?.data?.message || err.message);
    }
};

module.exports = { syncDiscounts, createDiscount, updateDiscount };
