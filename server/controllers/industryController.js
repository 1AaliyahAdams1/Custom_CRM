const industryService = require("../services/industryService");

// Get all industries (optionally filter active only)
async function getAllIndustries(req, res) {
  try {
    // Validation of query parameters could go here

    const activeOnly = req.query.activeOnly === "true"; // optional query param
    const industries = await industryService.getAllIndustries(activeOnly);
    res.json(industries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get single industry by ID
async function getIndustryById(req, res) {
  try {
    // Validation of req.params.id could go here

    const id = parseInt(req.params.id, 10);
    const industry = await industryService.getIndustryById(id);
    if (!industry) {
      return res.status(404).json({ error: "Industry not found" });
    }
    res.json(industry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Create a new industry
async function createIndustry(req, res) {
  try {
    // Validation of req.body fields could go here

    const { industryName, active } = req.body;
    // Get changedBy from authenticated user or fallback
    const changedBy = req.user?.username || "System";

    const newIndustry = await industryService.createIndustry(industryName, active, changedBy);
    res.status(201).json(newIndustry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update industry by ID
async function updateIndustry(req, res) {
  try {
    // Validation of req.params.id and req.body could go here

    const id = parseInt(req.params.id, 10);
    const data = req.body;
    const changedBy = req.user?.username || "System";

    const result = await industryService.updateIndustry(id, data, changedBy);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Delete (soft delete) industry by ID
async function deleteIndustry(req, res) {
  try {
    // Validation of req.params.id could go here

    const id = parseInt(req.params.id, 10);
    const changedBy = req.user?.username || "System";

    const result = await industryService.deleteIndustry(id, changedBy);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAllIndustries,
  getIndustryById,
  createIndustry,
  updateIndustry,
  deleteIndustry,
};
