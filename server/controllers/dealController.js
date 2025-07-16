const dealService = require("../services/dealService");

// Helper to get changedBy (only from authenticated user)
function getChangedBy(req) {
  return req.user?.username || "UnknownUser";
}


// Get all deals
async function getDeals(req, res) {
  try {
    // Validation can go here if needed

    const deals = await dealService.getAllDeals();
    res.json(deals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Create a new deal
async function createDeal(req, res) {

  // Validation should go here

  try {
    const changedBy = getChangedBy(req);
    const newDeal = await dealService.createDeal(req.body, changedBy);
    res.status(201).json(newDeal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update a deal by ID
async function updateDeal(req, res) {
  const id = parseInt(req.params.id, 10);
  // Validate ID here
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid deal ID" });
  }

  // Validation should go here

  try {
    const changedBy = getChangedBy(req);
    const updatedDeal = await dealService.updateDeal(id, req.body, changedBy);
    res.json(updatedDeal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Delete a deal by ID
async function deleteDeal(req, res) {
  const id = parseInt(req.params.id, 10);
  // Validate ID here
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid deal ID" });
  }

  try {
    const changedBy = getChangedBy(req);
    const deleted = await dealService.deleteDeal(id, changedBy);
    res.json(deleted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get deal details by ID
async function getDealDetails(req, res) {
  const dealId = parseInt(req.params.id, 10);
  // Validate ID here
  if (isNaN(dealId)) {
    return res.status(400).json({ error: "Invalid deal ID" });
  }

  try {
    const dealDetails = await dealService.getDealDetails(dealId);
    if (!dealDetails || dealDetails.length === 0) {
      return res.status(404).json({ error: "Deal not found" });
    }
    res.json(dealDetails);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch deal details" });
  }
}

module.exports = {
  getDeals,
  createDeal,
  updateDeal,
  deleteDeal,
  getDealDetails,
};
