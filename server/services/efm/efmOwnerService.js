// service/efm/efmOwnerService.js
const axios = require('axios');
const ownersData = require('../../data/efm/efmOwnerRepository');
const efmConfig = require('../../efmConfig'); 

// Fetch owners for a company
const fetchOwnersFromEFM = async (companyID, page = 1, pageSize = 50) => {
    try {
        const url = `${efmConfig.baseURL}/owners/by-company/${companyID}?page=${page}&pageSize=${pageSize}&apikey=${efmConfig.apiKey}`;
        const res = await axios.get(url);

        // Normalize response
        return res.data?.data?.owners || res.data?.data || [];
    } catch (err) {
        console.error(`Error fetching owners for company ${companyID}:`, err.message);
        return [];
    }
};

// Sync owners into local DB
const syncOwners = async (companyID) => {
    if (!companyID) throw new Error('companyID is required for syncing owners');

    let page = 1;
    let more = true;
    let totalSynced = 0;

    while (more) {
        const owners = await fetchOwnersFromEFM(companyID, page);

        if (!owners.length) {
            more = false;
            break;
        }

        for (const owner of owners) {
            await ownersData.insertOrUpdateOwner(owner);
            totalSynced++;
        }

        page++;
    }

    return { 
        success: true, 
        message: `Owners for company ${companyID} synced successfully`, 
        totalSynced 
    };
};

module.exports = { syncOwners };
