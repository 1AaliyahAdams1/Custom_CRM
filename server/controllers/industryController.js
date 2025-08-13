const industryService = require("../services/industryService");

async function getAllIndustries(req, res) {
  try {
    const industries = await industryService.getAllIndustries();
    res.json(industries);
  } catch (err) {
    console.error("Error getting all industries:", err);
    res.status(500).json({ error: "Failed to get industries" });
  }
}

async function getIndustryById(req, res) {
  try {
    const industry = await industryService.getIndustryById(req.params.id);
    res.json(industry);
  } catch (err) {
    console.error("Error getting industry by ID:", err);
    res.status(500).json({ error: "Failed to get industry" });
  }
}

async function createIndustry(req, res) {
  try {
    await industryService.createIndustry(req.body.IndustryName);
    res.status(201).json({ message: "Industry created" });
  } catch (err) {
    console.error("Error creating industry:", err);
    res.status(500).json({ error: "Failed to create industry" });
  }
}

async function updateIndustry(req, res) {
  try {
    await industryService.updateIndustry(req.params.id, req.body.IndustryName);
    res.json({ message: "Industry updated" });
  } catch (err) {
    console.error("Error updating industry:", err);
    res.status(500).json({ error: "Failed to update industry" });
  }
}

async function deactivateIndustry(req, res) {
  try {
    await industryService.deactivateIndustry(req.params.id);
    res.json({ message: "Industry deactivated" });
  } catch (err) {
    console.error("Error deactivating industry:", err);
    res.status(500).json({ error: "Failed to deactivate industry" });
  }
}

async function reactivateIndustry(req, res) {
  try {
    await industryService.reactivateIndustry(req.params.id);
    res.json({ message: "Industry reactivated" });
  } catch (err) {
    console.error("Error reactivating industry:", err);
    res.status(500).json({ error: "Failed to reactivate industry" });
  }
}

async function deleteIndustry(req, res) {
  try {
    await industryService.deleteIndustry(req.params.id);
    res.json({ message: "Industry deleted" });
  } catch (err) {
    console.error("Error deleting industry:", err);
    res.status(500).json({ error: "Failed to delete industry" });
  }
}

module.exports = {
  getAllIndustries,
  getIndustryById,
  createIndustry,
  updateIndustry,
  deactivateIndustry,
  reactivateIndustry,
  deleteIndustry,
};
