const dealStageService = require("../services/dealStageService");

async function getAllDealStages(req, res) {
  try {
    const dealStages = await dealStageService.getAllDealStages();
    res.json(dealStages);
  } catch (err) {
    console.error("Error getting all deal stages:", err);
    res.status(500).json({ error: "Failed to get deal stages" });
  }
}

async function getDealStageById(req, res) {
  try {
    const dealStage = await dealStageService.getDealStageById(req.params.id);
    res.json(dealStage);
  } catch (err) {
    console.error("Error getting deal stage by ID:", err);
    res.status(500).json({ error: "Failed to get deal stage" });
  }
}

async function createDealStage(req, res) {
  try {
    const newDealStage = await dealStageService.createDealStage(req.body);
    res.status(201).json(newDealStage);
  } catch (err) {
    console.error("Error creating deal stage:", err);
    res.status(500).json({ error: "Failed to create deal stage" });
  }
}

async function updateDealStage(req, res) {
  try {
    const updatedDealStage = await dealStageService.updateDealStage(req.params.id, req.body);
    res.json(updatedDealStage);
  } catch (err) {
    console.error("Error updating deal stage:", err);
    res.status(500).json({ error: "Failed to update deal stage" });
  }
}

async function deactivateDealStage(req, res) {
  try {
    const result = await dealStageService.deactivateDealStage(req.params.id);
    res.json(result);
  } catch (err) {
    console.error("Error deactivating deal stage:", err);
    res.status(500).json({ error: "Failed to deactivate deal stage" });
  }
}

async function reactivateDealStage(req, res) {
  try {
    const result = await dealStageService.reactivateDealStage(req.params.id);
    res.json(result);
  } catch (err) {
    console.error("Error reactivating deal stage:", err);
    res.status(500).json({ error: "Failed to reactivate deal stage" });
  }
}

async function deleteDealStage(req, res) {
  try {
    const result = await dealStageService.deleteDealStage(req.params.id);
    res.json(result);
  } catch (err) {
    console.error("Error deleting deal stage:", err);
    res.status(500).json({ error: "Failed to delete deal stage" });
  }
}

module.exports = {
  getAllDealStages,
  getDealStageById,
  createDealStage,
  updateDealStage,
  deactivateDealStage,
  reactivateDealStage,
  deleteDealStage,
};
