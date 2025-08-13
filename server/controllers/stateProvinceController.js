const stateService = require("../services/stateProvinceService");

async function getAllStates(req, res) {
  try {
    const data = await stateService.getAllStates();
    res.json(data);
  } catch (err) {
    console.error("Error getting all states:", err);
    res.status(500).json({ error: "Failed to get states" });
  }
}

async function getStateById(req, res) {
  try {
    const data = await stateService.getStateById(req.params.id);
    res.json(data);
  } catch (err) {
    console.error("Error getting state by ID:", err);
    res.status(500).json({ error: "Failed to get state" });
  }
}

async function getIDByStateProvince(req, res) {
  try {
    const id = await stateService.getIDByStateProvince(req.params.name);
    res.json({ StateProvinceID: id });
  } catch (err) {
    console.error("Error getting ID by state/province name:", err);
    res.status(500).json({ error: "Failed to get StateProvinceID" });
  }
}

async function createState(req, res) {
  try {
    const result = await stateService.createState(req.body);
    res.status(201).json(result);
  } catch (err) {
    console.error("Error creating state:", err);
    res.status(500).json({ error: "Failed to create state" });
  }
}

async function updateState(req, res) {
  try {
    const result = await stateService.updateState(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    console.error("Error updating state:", err);
    res.status(500).json({ error: "Failed to update state" });
  }
}

async function deactivateState(req, res) {
  try {
    const result = await stateService.deactivateState(req.params.id);
    res.json(result);
  } catch (err) {
    console.error("Error deactivating state:", err);
    res.status(500).json({ error: "Failed to deactivate state" });
  }
}

async function reactivateState(req, res) {
  try {
    const result = await stateService.reactivateState(req.params.id);
    res.json(result);
  } catch (err) {
    console.error("Error reactivating state:", err);
    res.status(500).json({ error: "Failed to reactivate state" });
  }
}

async function deleteState(req, res) {
  try {
    const result = await stateService.deleteState(req.params.id);
    res.json(result);
  } catch (err) {
    console.error("Error deleting state:", err);
    res.status(500).json({ error: "Failed to delete state" });
  }
}

module.exports = {
  getAllStates,
  getStateById,
  getIDByStateProvince,
  createState,
  updateState,
  deactivateState,
  reactivateState,
  deleteState,
};
