const repo = require("../data/activityTypeRepository");

const getAllActivityTypes = async () => {
  // Business logic: e.g., filter by active status, apply user role restrictions
  return await repo.getAll();
};

const getActivityTypeById = async (id) => {
  // Business logic: validate id, check permissions or if type exists
  return await repo.getById(id);
};

const createActivityType = async (data) => {
  // Business logic: validate data (e.g., name required, uniqueness)
  return await repo.create(data);
};

const updateActivityType = async (id, data) => {
  // Business logic: validate id & data, check for name conflict or changes
  return await repo.update(id, data);
};

const deleteActivityType = async (id) => {
  // Business logic: validate id, check if in use before deleting
  return await repo.delete(id);
};

module.exports = {
  getAllActivityTypes,
  getActivityTypeById,
  createActivityType,
  updateActivityType,
  deleteActivityType,
};
