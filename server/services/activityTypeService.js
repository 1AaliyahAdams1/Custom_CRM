const activityTypeRepo = require("../data/activityTypeRepository");

const getAllActivityTypes = async () => {
  return await activityTypeRepo.getAllActivityTypes();
};

const getActivityTypeById = async (TypeID) => {
  if (!TypeID) throw new Error("TypeID is required");
  return await activityTypeRepo.getActivityTypeById(TypeID);
};

const createActivityType = async (data) => {
  const { TypeName, Description } = data;
  if (!TypeName || !Description) throw new Error("Missing required fields");
  return await activityTypeRepo.createActivityType(data);
};

const updateActivityType = async (TypeID, data) => {
  if (!TypeID) throw new Error("TypeID is required");
  return await activityTypeRepo.updateActivityType(TypeID, data);
};

const deactivateActivityType = async (TypeID) => {
  if (!TypeID) throw new Error("TypeID is required");
  return await activityTypeRepo.deactivateActivityType(TypeID);
};

const reactivateActivityType = async (TypeID) => {
  if (!TypeID) throw new Error("TypeID is required");
  return await activityTypeRepo.reactivateActivityType(TypeID);
};

const deleteActivityType = async (TypeID) => {
  if (!TypeID) throw new Error("TypeID is required");
  return await activityTypeRepo.deleteActivityType(TypeID);
};

module.exports = {
  getAllActivityTypes,
  getActivityTypeById,
  createActivityType,
  updateActivityType,
  deactivateActivityType,
  reactivateActivityType,
  deleteActivityType,
};
