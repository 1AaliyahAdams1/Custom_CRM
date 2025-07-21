const dealService = require("../services/dealService");

// Helper to get changedBy from authenticated user or default
function getChangedBy(req) {
  return req.user?.username || "System";
}

// Get all deals
async function getAllDeals(req, res) {
  try {
    // Validation for filters, pagination, permissions can go here

    const deals = await dealService.getAllDeals();
    res.json(deals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Create a new deal
async function createDeal(req, res) {
  // Validation of req.body should go here

  try {
    const changedBy = getChangedBy(req);
    const newDeal = await dealService.createDeal(req.body, changedBy);
    res.status(201).json(newDeal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update deal by ID
async function updateDeal(req, res) {
  const id = parseInt(req.params.id, 10);
  // Validation of id and req.body should go here

  try {
    const changedBy = getChangedBy(req);
    const updatedDeal = await dealService.updateDeal(id, req.body, changedBy);
    res.json(updatedDeal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Delete deal by ID
async function deleteDeal(req, res) {
  const id = parseInt(req.params.id, 10);
  // Validation of id should go here

  try {
    const changedBy = getChangedBy(req);
    const deleted = await dealService.deleteDeal(id, changedBy);
    res.json(deleted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get deal details including products, notes, attachments
async function getDealDetails(req, res) {
  const id = parseInt(req.params.id, 10);
  // Validation of id should go here

  try {
    const details = await dealService.getDealDetails(id);
    if (!details) {
      return res.status(404).json({ error: "Deal not found" });
    }
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAllDeals,
  createDeal,
  updateDeal,
  deleteDeal,
  getDealDetails,
};
