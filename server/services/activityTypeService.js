const repo = require("../data/activityTypeRepository");

// Service function to get all activity types from repository
const getAllActivityTypes = async () => {
  // Add business logic here if needed (e.g., filtering, caching)
  return await repo.getAll();
};

module.exports = {
  getAllActivityTypes,
};
