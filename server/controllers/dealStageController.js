const dealStageService = require("../services/dealStageService");

async function getAllDealStages(req, res) {
  try {
    
    // Validation could go here if this endpoint had any input to validate

    const dealStages = await dealStageService.getAllDealStages();
    res.json(dealStages);
  } catch (error) {
    console.error("Failed to get deal stages:", error);
    res.status(500).json({ message: "Failed to get deal stages" });
  }
}

module.exports = {
  getAllDealStages,
};
