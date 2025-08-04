const activityRepo = require("../data/activityRepository");

const getAllActivities = async (onlyActive = true) => {
  return await activityRepo.getAllActivities(onlyActive);
};


const getActivityByID = async (ActivityID) => {
  if (!ActivityID) throw new Error("ActivityID is required");
  return await activityRepo.getActivityByID(ActivityID);
};

const createActivity = async (activityData) => {
  const { AccountID, TypeID, PriorityLevelID, DueToStart, DueToEnd, Completed } = activityData;

  if (!AccountID || !TypeID || !PriorityLevelID || !DueToStart || !DueToEnd || !Completed) {
    throw new Error("Missing required activity fields");
  }

  return await activityRepo.createActivity(activityData);
};

const updateActivity = async (ActivityID, activityData) => {
  if (!ActivityID) throw new Error("ActivityID is required");
  return await activityRepo.updateActivity(ActivityID, activityData);
};

const deactivateActivity = async (ActivityID) => {
  if (!ActivityID) throw new Error("ActivityID is required");
  return await activityRepo.deactivateActivity(ActivityID);
};

const reactivateActivity = async (ActivityID) => {
  if (!ActivityID) throw new Error("ActivityID is required");
  return await activityRepo.reactivateActivity(ActivityID);
};

const deleteActivity = async (ActivityID) => {
  if (!ActivityID) throw new Error("ActivityID is required");
  return await activityRepo.deleteActivity(ActivityID);
};

module.exports = {
  getAllActivities,
  getActivityByID,
  createActivity,
  updateActivity,
  deactivateActivity,
  reactivateActivity,
  deleteActivity,
};
