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

// Bulk Operations
const bulkMarkActivitiesComplete = async (activityIds) => {
  if (!Array.isArray(activityIds) || activityIds.length === 0) {
    throw new Error("Activity IDs array is required");
  }

  try {
    const updatePromises = activityIds.map(id => 
      activityRepo.updateActivity(id, { Completed: true })
    );
    
    const results = await Promise.all(updatePromises);
    
    return {
      success: true,
      updatedCount: results.length,
      message: `Marked ${results.length} activities as complete`
    };
  } catch (error) {
    throw new Error(`Failed to bulk mark activities complete: ${error.message}`);
  }
};

const bulkMarkActivitiesIncomplete = async (activityIds) => {
  if (!Array.isArray(activityIds) || activityIds.length === 0) {
    throw new Error("Activity IDs array is required");
  }

  try {
    const updatePromises = activityIds.map(id => 
      activityRepo.updateActivity(id, { Completed: false })
    );
    
    const results = await Promise.all(updatePromises);
    
    return {
      success: true,
      updatedCount: results.length,
      message: `Marked ${results.length} activities as incomplete`
    };
  } catch (error) {
    throw new Error(`Failed to bulk mark activities incomplete: ${error.message}`);
  }
};

const bulkUpdateActivityStatus = async (activityIds, status) => {
  if (!Array.isArray(activityIds) || activityIds.length === 0) {
    throw new Error("Activity IDs array is required");
  }
  if (status === undefined || status === null) {
    throw new Error("Status is required");
  }

  try {
    const updatePromises = activityIds.map(id => 
      activityRepo.updateActivity(id, { Completed: status })
    );
    
    const results = await Promise.all(updatePromises);
    
    return {
      success: true,
      updatedCount: results.length,
      message: `Updated status for ${results.length} activities`
    };
  } catch (error) {
    throw new Error(`Failed to bulk update activity status: ${error.message}`);
  }
};

const bulkUpdateActivityPriority = async (activityIds, priorityLevelId) => {
  if (!Array.isArray(activityIds) || activityIds.length === 0) {
    throw new Error("Activity IDs array is required");
  }
  if (!priorityLevelId) {
    throw new Error("Priority Level ID is required");
  }

  try {
    const updatePromises = activityIds.map(id => 
      activityRepo.updateActivity(id, { PriorityLevelID: priorityLevelId })
    );
    
    const results = await Promise.all(updatePromises);
    
    return {
      success: true,
      updatedCount: results.length,
      message: `Updated priority for ${results.length} activities`
    };
  } catch (error) {
    throw new Error(`Failed to bulk update activity priority: ${error.message}`);
  }
};

const bulkUpdateActivityDueDates = async (activityIds, dueToStart, dueToEnd) => {
  if (!Array.isArray(activityIds) || activityIds.length === 0) {
    throw new Error("Activity IDs array is required");
  }
  if (!dueToStart && !dueToEnd) {
    throw new Error("At least one due date (start or end) is required");
  }

  try {
    const updateData = {};
    if (dueToStart) updateData.DueToStart = dueToStart;
    if (dueToEnd) updateData.DueToEnd = dueToEnd;

    const updatePromises = activityIds.map(id => 
      activityRepo.updateActivity(id, updateData)
    );
    
    const results = await Promise.all(updatePromises);
    
    return {
      success: true,
      updatedCount: results.length,
      message: `Updated due dates for ${results.length} activities`
    };
  } catch (error) {
    throw new Error(`Failed to bulk update activity due dates: ${error.message}`);
  }
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

  // Bulk operations
  bulkMarkActivitiesComplete,
  bulkMarkActivitiesIncomplete,
  bulkUpdateActivityStatus,
  bulkUpdateActivityPriority,
  bulkUpdateActivityDueDates,

};
