const stateService = require("../services/stateProvinceService");

async function getAllStates(req, res) {
  try {
    const data = await stateService.getAllStates();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getStateById(req, res) {
  try {
    const data = await stateService.getStateById(parseInt(req.params.id));
    if (!data) return res.status(404).json({ message: "State/Province not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getIDByStateProvince(req, res) {
  try {
    const name = req.params.name;
    if (!name) return res.status(400).json({ message: "State/Province name is required" });
    const id = await stateService.getIDByStateProvince(name);
    if (!id) return res.status(404).json({ message: "State/Province not found" });
    res.json({ StateProvinceID: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createState(req, res) {
  try {
    const result = await stateService.createState(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateState(req, res) {
  try {
    const result = await stateService.updateState(parseInt(req.params.id), req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deactivateState(req, res) {
  try {
    const result = await stateService.deactivateState(parseInt(req.params.id));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function reactivateState(req, res) {
  try {
    const result = await stateService.reactivateState(parseInt(req.params.id));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteState(req, res) {
  try {
    const result = await stateService.deleteState(parseInt(req.params.id));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
