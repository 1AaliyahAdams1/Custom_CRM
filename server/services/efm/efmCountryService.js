const axios = require('axios');
const countriesData = require('../../data/efm/efmCountryRepository');
const efmConfig = require('../../efmConfig'); 

// Fetch countries from EFM API
const fetchCountriesFromEFM = async (sinceId = 0) => {
    try {
        const url = `${efmConfig.baseURL}/countries/bulk-export?sinceId=${sinceId}&apikey=${efmConfig.apiKey}`;
        const res = await axios.get(url);

        return res.data?.data?.countries || [];
    } catch (err) {
        console.error('Error fetching countries from EFM:', err.message);
        return [];
    }
};

// Sync countries into local DB
const syncCountries = async () => {
    let sinceId = 0;
    let more = true;
    let totalSynced = 0;

    while (more) {
        const countries = await fetchCountriesFromEFM(sinceId);

        if (!countries.length) {
            more = false;
            break;
        }

        for (const country of countries) {
            await countriesData.insertOrUpdateCountry(country);
            sinceId = Math.max(sinceId, country.countryID);
            totalSynced++;
        }
    }

    return { 
        success: true, 
        message: 'Countries synced successfully', 
        totalSynced 
    };
};

module.exports = { syncCountries };
