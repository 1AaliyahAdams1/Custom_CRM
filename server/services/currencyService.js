const currencyRepo = require("../data/currencyRepository");

// Hardcoded userId for now
const userId = 1;

async function getAllCurrencies() {
  return await currencyRepo.getAllCurrencies();
}

async function getCurrencyById(id) {
  return await currencyRepo.getCurrencyById(id);
}

async function createCurrency(data) {
  return await currencyRepo.createCurrency(data, userId);
}

async function updateCurrency(id, data) {
  return await currencyRepo.updateCurrency(id, data, userId);
}

async function deactivateCurrency(id) {
  const currency = await currencyRepo.getCurrencyById(id);
  if (!currency) {
    throw new Error("Currency not found");
  }

  if (currency.IsActive === false || currency.IsActive === 0) {
    throw new Error("Currency is already deactivated");
  }

  currency.IsActive = false;

  return await currencyRepo.deleteCurrency(currency.CurrencyID, userId);
}

async function reactivateCurrency(id) {
  return await currencyRepo.reactivateCurrency(id, userId);
}

async function hardDeleteCurrency(id) {
  return await currencyRepo.hardDeleteCurrency(id, userId);
}

module.exports = {
  getAllCurrencies,
  getCurrencyById,
  createCurrency,
  updateCurrency,
  deactivateCurrency,
  reactivateCurrency,
  hardDeleteCurrency,
};
