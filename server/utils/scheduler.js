// utils/scheduler.js
const cron = require('node-cron');
const venueService = require('../services/efm/efmVenueService');
const eventService = require('../services/efm/efmEventService');
const companyService = require('../services/efm/efmCompanyService');
const ownerService = require('../services/efm/efmOwnerService');
const countryService = require('../services/efm/efmCountryService');
const cityService = require('../services/efm/efmCityService');
const discountService = require('../services/efm/efmDiscountService');

let isSyncRunning = false; // Lock flag

const logSync = (type, result) => {
  console.log(`[${new Date().toISOString()}] ${type} sync complete.`, result);
};

async function runEFMSync() {
  if (isSyncRunning) {
    console.log(`[${new Date().toISOString()}] Sync already running. Skipping this trigger.`);
    return;
  }

  isSyncRunning = true;
  console.log(`[${new Date().toISOString()}] Starting EFM sync...`);

  try {
    // Countries, Cities, Venues, Events, Companies
    const [countryResult, cityResult, venueResult, eventResult, companyResult] = await Promise.all([
      countryService.syncCountries(),
      cityService.syncCities(),
      venueService.syncVenues(),
      eventService.syncEvents(),
      companyService.syncCompanies(),
    ]);

    logSync('Countries', countryResult);
    logSync('Cities', cityResult);
    logSync('Venues', venueResult);
    logSync('Events', eventResult);
    logSync('Companies', companyResult);

    // Owners & Discounts per company in parallel
    if (companyResult.data?.length) {
      await Promise.all(
        companyResult.data.map(async (company) => {
          try {
            const [ownerResult, discountResult] = await Promise.all([
              ownerService.syncOwners(company.companyID).catch(err => {
                console.error(`[${new Date().toISOString()}] Error syncing owners for company ${company.companyName}:`, err.message);
              }),
              discountService.syncDiscounts(company.companyID).catch(err => {
                console.error(`[${new Date().toISOString()}] Error syncing discounts for company ${company.companyName}:`, err.message);
              }),
            ]);

            if (ownerResult) logSync(`Owners for company ${company.companyName}`, ownerResult);
            if (discountResult) console.log(`[${new Date().toISOString()}] Discounts for company ${company.companyName} synced: ${discountResult.totalSynced || 0}`);
          } catch (err) {
            console.error(`[${new Date().toISOString()}] Unexpected error for company ${company.companyName}:`, err.message);
          }
        })
      );
    }

    console.log(`[${new Date().toISOString()}] EFM sync finished successfully.`);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] EFM sync error:`, err.message);
  } finally {
    isSyncRunning = false; // Release lock
  }
}

function startEFMSyncScheduler() {
  // Run immediately at startup
  // runEFMSync();

  // Schedule hourly sync
  cron.schedule('0 * * * *', () => {
    console.log(`[${new Date().toISOString()}] Starting hourly EFM sync...`);
    runEFMSync();
  });

  console.log('EFM sync scheduler started (immediate + hourly).');
}

module.exports = { startEFMSyncScheduler, runEFMSync };
