const dealService = require("../services/dealService");

async function getAllDeals(req, res) {
  try {
    const deals = await dealService.getAllDeals(onlyActive = true);
    res.json(deals);
  } catch (err) {
    console.error("Error getting all deals:", err);
    res.status(500).json({ error: "Failed to get deals" });
  }
}

async function getDealById(req, res) {
  try {
    const deal = await dealService.getDealById(req.params.id);
    res.json(deal);
  } catch (err) {
    console.error("Error getting deal by ID:", err);
    res.status(500).json({ error: "Failed to get deal" });
  }
}

async function createDeal(req, res) {
  try {
    const newDeal = await dealService.createDeal(req.body);
    res.status(201).json(newDeal);
  } catch (err) {
    console.error("Error creating deal:", err);
    res.status(500).json({ error: "Failed to create deal" });
  }
}

async function updateDeal(req, res) {
  try {
    const updated = await dealService.updateDeal(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    console.error("Error updating deal:", err);
    res.status(500).json({ error: "Failed to update deal" });
  }
}

async function deactivateDeal(req, res) {
  try {
    const result = await dealService.deactivateDeal(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    console.error("Error deactivating deal:", err);
    res.status(500).json({ error: "Failed to deactivate deal" });
  }
}

async function reactivateDeal(req, res) {
  try {
    const result = await dealService.reactivateDeal(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    console.error("Error reactivating deal:", err);
    res.status(500).json({ error: "Failed to reactivate deal" });
  }
}

async function deleteDeal(req, res) {
  try {
    const result = await dealService.deleteDeal(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    console.error("Error deleting deal:", err);
    res.status(500).json({ error: "Failed to delete deal" });
  }
}

module.exports = {
  getAllDeals,
  getDealById,
  createDeal,
  updateDeal,
  deactivateDeal,
  reactivateDeal,
  deleteDeal,
};
