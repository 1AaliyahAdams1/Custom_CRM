const priorityLevelService = require("../services/priorityLevelService");

// Get all priority levels
async function getAllPriorityLevels(req, res) {
  try {
    // Validation can be added here (e.g., query params)

    const levels = await priorityLevelService.getAllPriorityLevels();
    res.json(levels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get a single priority level by ID
async function getPriorityLevelById(req, res) {
  try {
    // Validation for req.params.id should be here

    const id = parseInt(req.params.id, 10);
    const level = await priorityLevelService.getPriorityLevelById(id);
    if (!level) {
      return res.status(404).json({ error: "Priority level not found" });
    }
    res.json(level);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Create a new priority level
async function createPriorityLevel(req, res) {
  try {
    // Validation for req.body should be here

    const data = req.body;
    const changedBy = req.user?.username || "System";

    const newLevel = await priorityLevelService.createPriorityLevel(data, changedBy);
    res.status(201).json(newLevel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update a priority level by ID
async function updatePriorityLevel(req, res) {
  try {
    // Validation for req.params.id and req.body should be here

    const id = parseInt(req.params.id, 10);
    const data = req.body;
    const changedBy = req.user?.username || "System";

    const result = await priorityLevelService.updatePriorityLevel(id, data, changedBy);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Delete a priority level by ID
async function deletePriorityLevel(req, res) {
  try {
    // Validation for req.params.id should be here

    const id = parseInt(req.params.id, 10);
    const changedBy = req.user?.username || "System";

    const result = await priorityLevelService.deletePriorityLevel(id, changedBy);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAllPriorityLevels,
  getPriorityLevelById,
  createPriorityLevel,
  updatePriorityLevel,
  deletePriorityLevel,
};
