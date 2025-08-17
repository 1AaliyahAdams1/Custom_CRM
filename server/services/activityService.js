//services/activityService.js

const activityRepo = require("../data/activityRepository");

const getAllActivities = async (onlyActive = true) => {
  return await activityRepo.getAllActivities(onlyActive);
};

const getActivityByID = async (ActivityID) => {
  if (!ActivityID) {
    throw new Error("Activity ID is required");
  }
  return await activityRepo.getActivityByID(ActivityID);
};

const createActivity = async (activityData) => {
  const { activity_name, type, date } = activityData;

  // Validation
  const validationErrors = validateActivityData(activityData);
  if (validationErrors.length > 0) {
    throw new Error(`Validation failed: ${validationErrors.join(", ")}`);
  }

  return await activityRepo.createActivity(activityData);
};

const updateActivity = async (ActivityID, activityData) => {
  if (!ActivityID) {
    throw new Error("Activity ID is required");
  }

  // Validation
  const validationErrors = validateActivityData(activityData);
  if (validationErrors.length > 0) {
    throw new Error(`Validation failed: ${validationErrors.join(", ")}`);
  }

  return await activityRepo.updateActivity(ActivityID, activityData);
};

const deactivateActivity = async (ActivityID) => {
  if (!ActivityID) {
    throw new Error("Activity ID is required");
  }
  return await activityRepo.deactivateActivity(ActivityID);
};

const reactivateActivity = async (ActivityID) => {
  if (!ActivityID) {
    throw new Error("Activity ID is required");
  }
  return await activityRepo.reactivateActivity(ActivityID);
};

const deleteActivity = async (ActivityID) => {
  if (!ActivityID) {
    throw new Error("Activity ID is required");
  }
  return await activityRepo.deleteActivity(ActivityID);
};

const getActivitiesByUser = async (UserID) => {
  if (!UserID) {
    throw new Error("User ID is required");
  }
  return await activityRepo.getActivitiesByUser(UserID);
};

// Validation helper function
const validateActivityData = (activityData) => {
  const errors = [];
  const { activity_name, type, date } = activityData;

  // Activity name validation
  if (!activity_name || !activity_name.trim()) {
    errors.push("Activity name is required");
  } else {
    if (activity_name.length < 2) {
      errors.push("Activity name must be at least 2 characters");
    }
    if (activity_name.length > 100) {
      errors.push("Activity name cannot exceed 100 characters");
    }
  }

  // Type validation
  if (!type || !type.trim()) {
    errors.push("Type is required");
  } else if (type.length > 50) {
    errors.push("Type cannot exceed 50 characters");
  }

  // Date validation
  if (!date || !date.trim()) {
    errors.push("Date is required");
  } else {
    const dateValue = new Date(date);
    if (isNaN(dateValue.getTime())) {
      errors.push("Date must be a valid date");
    }
  }

  return errors;
};

// Input sanitization helper
const sanitizeActivityData = (activityData) => {
  const sanitized = {};

  if (activityData.activity_name) {
    sanitized.activity_name = activityData.activity_name.toString().trim();
  }

  if (activityData.type) {
    sanitized.type = activityData.type.toString().trim();
  }

  if (activityData.date) {
    sanitized.date = activityData.date.toString().trim();
  }

  return sanitized;
};

module.exports = {
  getAllActivities,
  getActivityByID,
  createActivity,
  updateActivity,
  deactivateActivity,
  reactivateActivity,
  deleteActivity,
  getActivitiesByUser,
  validateActivityData,
  sanitizeActivityData,
};
