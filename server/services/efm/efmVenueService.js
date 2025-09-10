const axios = require('axios');
const venuesData = require('../../data/efm/efmVenueRepository');
const efmConfig = require('../../efmConfig');

const fetchVenuesFromEFM = async (sinceId = 0) => {
    try {
        const url = `${efmConfig.baseURL}/venues/bulk-export?sinceId=${sinceId}&apikey=${efmConfig.apiKey}`;
        const res = await axios.get(url);

        if (res.data?.data?.venues) return res.data.data.venues;
        if (res.data?.venues) return res.data.venues;
        return [];
    } catch (err) {
        console.error('Error fetching venues from EFM:', err.message);
        return [];
    }
};

const syncVenues = async () => {
    let sinceId = 0;
    let totalSynced = 0;

    const venues = await fetchVenuesFromEFM(sinceId);
    for (const venue of venues) {
        await venuesData.insertOrUpdateVenue(venue);
        console.log(`Venue synced: ID ${venue.id} - ${venue.name}`);
        totalSynced++;
        sinceId = Math.max(sinceId, venue.id);
    }

    return { success: true, totalSynced };
};

module.exports = { syncVenues };  
