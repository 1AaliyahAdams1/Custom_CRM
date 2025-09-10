const axios = require('axios');
const citiesData = require('../../data/efm/efmCityRepository');
const efmConfig = require('../../efmConfig'); 

// Fetch cities from EFM API
const fetchCitiesFromEFM = async (sinceId = 0) => {
    try {
        const url = `${efmConfig.baseURL}/cities/bulk-export?sinceId=${sinceId}&apikey=${efmConfig.apiKey}`;
        const res = await axios.get(url);

        // ✅ API response structure: res.data.data.cities
        return res.data?.data?.cities || [];
    } catch (err) {
        console.error('Error fetching cities from EFM:', err.message);
        return [];
    }
};

// Sync cities into local DB
const syncCities = async () => {
    let sinceId = 0;
    let more = true;
    let totalSynced = 0;

    while (more) {
        const cities = await fetchCitiesFromEFM(sinceId);

        if (!cities.length) {
            more = false;
            break;
        }

        for (const city of cities) {
            await citiesData.insertOrUpdateCity(city);
            sinceId = Math.max(sinceId, city.cityID);
            totalSynced++;
        }
    }

    return { 
        success: true, 
        message: `Cities synced successfully`, 
        totalSynced 
    };
};

module.exports = { syncCities };
