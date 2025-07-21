const dealStageService = require("../services/dealStageService");

// Get all deal stages
async function getAllDealStages(req, res) {
  try {
    // Validation or permission checks can go here

    const dealStages = await dealStageService.getAllDealStages();
    res.json(dealStages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAllDealStages,
};
