const axios = require('axios');
const companiesData = require('../../data/efm/efmCompanyRepository');
const efmConfig = require('../../efmConfig'); 

// Fetch companies from EFM API
const fetchCompaniesFromEFM = async (sinceId = 0) => {
    try {
        const url = `${efmConfig.baseURL}/companies/bulk-export?sinceId=${sinceId}&apikey=${efmConfig.apiKey}`;
        const res = await axios.get(url);

        return res.data?.data?.companies || [];
    } catch (err) {
        console.error('Error fetching companies from EFM:', err.message);
        return [];
    }
};

// Sync companies into local DB
const syncCompanies = async () => {
    let sinceId = 0;
    let more = true;
    let totalSynced = 0;

    while (more) {
        const companies = await fetchCompaniesFromEFM(sinceId);

        if (!companies.length) {
            more = false;
            break;
        }

        for (const company of companies) {
            await companiesData.insertOrUpdateCompany(company);
            sinceId = Math.max(sinceId, company.companyID);
            totalSynced++;
        }
    }

    return { 
        success: true, 
        message: `Companies synced successfully`, 
        totalSynced 
    };
};

module.exports = { syncCompanies };
