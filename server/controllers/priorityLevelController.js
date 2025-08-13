const priorityLevelService = require("../services/priorityLevelService");

async function getAllPriorityLevels(req, res) {
  try {
    const data = await priorityLevelService.getAllPriorityLevels();
    res.json(data);
  } catch (err) {
    console.error("Error getting all priority levels:", err);
    res.status(500).json({ error: "Failed to get priority levels" });
  }
}

async function getPriorityLevelById(req, res) {
  try {
    const data = await priorityLevelService.getPriorityLevelById(req.params.id);
    res.json(data);
  } catch (err) {
    console.error("Error getting priority level by ID:", err);
    res.status(500).json({ error: "Failed to get priority level" });
  }
}

async function createPriorityLevel(req, res) {
  try {
    await priorityLevelService.createPriorityLevel(req.body);
    res.status(201).json({ message: "Priority level created" });
  } catch (err) {
    console.error("Error creating priority level:", err);
    res.status(500).json({ error: "Failed to create priority level" });
  }
}

async function updatePriorityLevel(req, res) {
  try {
    await priorityLevelService.updatePriorityLevel(req.params.id, req.body);
    res.json({ message: "Priority level updated" });
  } catch (err) {
    console.error("Error updating priority level:", err);
    res.status(500).json({ error: "Failed to update priority level" });
  }
}

async function deactivatePriorityLevel(req, res) {
  try {
    await priorityLevelService.deactivatePriorityLevel(req.params.id);
    res.json({ message: "Priority level deactivated" });
  } catch (err) {
    console.error("Error deactivating priority level:", err);
    res.status(500).json({ error: "Failed to deactivate priority level" });
  }
}

async function reactivatePriorityLevel(req, res) {
  try {
    await priorityLevelService.reactivatePriorityLevel(req.params.id);
    res.json({ message: "Priority level reactivated" });
  } catch (err) {
    console.error("Error reactivating priority level:", err);
    res.status(500).json({ error: "Failed to reactivate priority level" });
  }
}

async function deletePriorityLevel(req, res) {
  try {
    await priorityLevelService.deletePriorityLevel(req.params.id);
    res.json({ message: "Priority level deleted" });
  } catch (err) {
    console.error("Error deleting priority level:", err);
    res.status(500).json({ error: "Failed to delete priority level" });
  }
}

module.exports = {
  getAllPriorityLevels,
  getPriorityLevelById,
  createPriorityLevel,
  updatePriorityLevel,
  deactivatePriorityLevel,
  reactivatePriorityLevel,
  deletePriorityLevel,
};
