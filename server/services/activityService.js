const activityRepo = require("../data/activityRepository");

const getAllActivities = async (onlyActive = true) => {
  return await activityRepo.getAllActivities(onlyActive);
};


const getActivityByID = async (ActivityID) => {
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
  return await activityRepo.updateActivity(ActivityID, activityData);
};

const deactivateActivity = async (ActivityID) => {
  return await activityRepo.deactivateActivity(ActivityID);
};

const reactivateActivity = async (ActivityID) => {
  return await activityRepo.reactivateActivity(ActivityID);
};

const deleteActivity = async (ActivityID) => {
  return await activityRepo.deleteActivity(ActivityID);
};


const getActivitiesByUser = async (UserID) => {
  return await activityRepo.getActivitiesByUser(UserID);
};

module.exports = {
  getAllActivities,
  getActivityByID,
  createActivity,
  updateActivity,
  deactivateActivity,
  reactivateActivity,
  deleteActivity,
  getActivitiesByUser
};
