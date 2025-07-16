const activityRepository = require("../data/activityRepository");

async function getAllActivities() {
  try {
    // Business logic for filtering, pagination,
    // permissions or transformations can be added here
    return await activityRepository.getAllActivities();
  } catch (error) {
    throw error;
  }
}

async function createActivity(activityData) {
  try {
    // Business logic for validating input data,
    // applying rules or modifying activityData before creation
    return await activityRepository.createActivity(activityData);
  } catch (error) {
    throw error;
  }
}

async function updateActivity(id, activityData) {
  try {
    // Business logic for validating update data,
    // checking permissions, detecting changes, etc.
    return await activityRepository.updateActivity(id, activityData);
  } catch (error) {
    throw error;
  }
}

async function deleteActivity(id) {
  try {
    // Business logic to check if deletion is allowed,
    // handle cascading deletes or archiving
    return await activityRepository.deleteActivity(id);
  } catch (error) {
    throw error;
  }
}

async function getActivityDetails(id) {
  try {
    // Business logic to enrich or transform details can be added here
    return await activityRepository.getActivityDetails(id);
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getAllActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  getActivityDetails,
};
