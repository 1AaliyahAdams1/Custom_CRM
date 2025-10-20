const currencyService = require("../services/currencyService");

// Get all currencies
async function getAllCurrencies(req, res) {
  try {
    console.log('=== CURRENCY CONTROLLER ===');
    console.log('Currency Controller: Fetching all currencies...');
    const currencies = await currencyService.getAllCurrencies();
    console.log('Currency Controller: Returning', currencies.length, 'currencies');
    console.log('Currency Controller: Sample currency:', currencies[0]);
    console.log('===========================');
    res.json(currencies);
  } catch (error) {
    console.error("=== CURRENCY CONTROLLER ERROR ===");
    console.error("Error getting all currencies:", error);
    console.error("Error stack:", error.stack);
    console.error("=================================");
    res.status(500).json({ message: error.message });
  }
}

// Get currency by ID
async function getCurrencyById(req, res) {
  try {
    const { id } = req.params;
    const currency = await currencyService.getCurrencyById(id);
    if (!currency) return res.status(404).json({ message: "Currency not found" });
    res.json(currency);
  } catch (error) {
    console.error(`Error getting currency ${req.params.id}:`, error);
    res.status(500).json({ message: error.message });
  }
}

// Create a new currency
async function createCurrency(req, res) {
  try {
    const data = req.body;
    const result = await currencyService.createCurrency(data);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating currency:", error);
    res.status(500).json({ message: error.message });
  }
}

// Update currency
async function updateCurrency(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;
    const result = await currencyService.updateCurrency(id, data);
    res.json(result);
  } catch (error) {
    console.error(`Error updating currency ${req.params.id}:`, error);
    res.status(500).json({ message: error.message });
  }
}

// Deactivate currency
async function deactivateCurrency(req, res) {
  try {
    const { id } = req.params;
    const result = await currencyService.deactivateCurrency(id);
    res.json(result);
  } catch (error) {
    console.error(`Error deactivating currency ${req.params.id}:`, error);
    res.status(500).json({ message: error.message });
  }
}

// Reactivate currency
async function reactivateCurrency(req, res) {
  try {
    const { id } = req.params;
    const result = await currencyService.reactivateCurrency(id);
    res.json(result);
  } catch (error) {
    console.error(`Error reactivating currency ${req.params.id}:`, error);
    res.status(500).json({ message: error.message });
  }
}

// Hard delete currency
async function hardDeleteCurrency(req, res) {
  try {
    const { id } = req.params;
    const result = await currencyService.hardDeleteCurrency(id);
    res.json(result);
  } catch (error) {
    console.error(`Error hard deleting currency ${req.params.id}:`, error);
    res.status(500).json({ message: error.message });
  }
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
