const sequenceService = require("../services/sequenceService");

// Get sequences and items by user
async function getSequencesandItemsByUser(req, res) {
  try {
    const sequences = await sequenceService.getSequencesandItemsByUser(req.params.userId);
    res.status(200).json(sequences);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get user sequences
async function getUserSequences(req, res) {
  try {
    const sequences = await sequenceService.getUserSequences(req.params.userId);
    res.status(200).json(sequences);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get activities by user
async function getActivitiesByUser(req, res) {
  try {
    const activities = await sequenceService.getActivitiesByUser(req.params.userId);
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getSequencesandItemsByUser,
  getUserSequences,
  getActivitiesByUser
};