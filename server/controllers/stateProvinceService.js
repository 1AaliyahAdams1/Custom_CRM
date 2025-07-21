const stateService = require("../services/stateService");

// Get all states/provinces
async function getAllStates(req, res) {
  try {
    // Validation or query param parsing could go here

    const states = await stateService.getAllStates();
    res.json(states);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get state/province by ID
async function getStateById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);

    // Validation for id could go here

    const state = await stateService.getStateById(id);

    // Handle not found
    if (!state) {
      return res.status(404).json({ error: "State/Province not found" });
    }

    res.json(state);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Create a new state/province
async function createState(req, res) {
  try {
    const stateData = req.body;

    // Validation for required fields (StateProvinceName, CountryID) could go here

    const changedBy = req.user?.username || "System";

    const newState = await stateService.createState(stateData, changedBy);
    res.status(201).json(newState);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update a state/province by ID
async function updateState(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const stateData = req.body;

    // Validation for id and body data could go here

    const changedBy = req.user?.username || "System";

    const result = await stateService.updateState(id, stateData, changedBy);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Delete a state/province by ID
async function deleteState(req, res) {
  try {
    const id = parseInt(req.params.id, 10);

    // Validation for id could go here

    const changedBy = req.user?.username || "System";

    const result = await stateService.deleteState(id, changedBy);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAllStates,
  getStateById,
  createState,
  updateState,
  deleteState,
};
