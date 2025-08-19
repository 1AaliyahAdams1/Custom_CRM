const sequenceRepo = require("../data/sequenceRepository");

// Hardcoded userId for now
//const userId = 1;

async function getSequencesandItemsByUser(userId) {
  return await sequenceRepo.getSequencesandItemsByUser(userId);
}

async function getUserSequences(userId) {
  return await sequenceRepo.getUserSequences(userId);
}

async function getActivitiesByUser(userId) {
  return await sequenceRepo.getActivitiesByUser(userId);
}

module.exports = {
  getSequencesandItemsByUser,
  getUserSequences,
  getActivitiesByUser
};