const sequenceRepo = require("../data/sequenceRepository");

//======================================
// Get work page activities (due today or overdue)
//======================================
const getWorkPageActivities = async (userId, options = {}) => {
  try {
    let activities = await sequenceRepo.getWorkPageActivities(userId);
    
    // Apply sorting if specified
    if (options.sortBy) {
      activities = sortActivities(activities, options.sortBy);
    }
    
    // Apply filtering if specified
    if (options.filter) {
      activities = filterActivities(activities, options.filter);
    }
    
    return activities;
  } catch (err) {
    console.error("Error in getWorkPageActivities:", err);
    throw err;
  }
};

//======================================
// Get account activities grouped for workspace tab
//======================================
const getAccountActivitiesGrouped = async (accountId, userId) => {
  return await sequenceRepo.getAccountActivitiesGrouped(accountId, userId);
};

//======================================
// Get activity by ID
//======================================
const getActivityByID = async (activityId, userId) => {
  return await sequenceRepo.getActivityByID(activityId, userId);
};

//======================================
// Update activity
//======================================
const updateActivity = async (activityId, userId, activityData) => {
  return await sequenceRepo.updateActivity(activityId, userId, activityData);
};

//======================================
// Update activity due date with cascade
//======================================
const updateActivityDueDateWithCascade = async (activityId, userId, newDueDate) => {
  return await sequenceRepo.updateActivityDueDateWithCascade(activityId, userId, newDueDate);
};

//======================================
// Complete activity and get next
//======================================
const completeActivityAndGetNext = async (activityId, userId) => {
  return await sequenceRepo.completeActivityAndGetNext(activityId, userId);
};

//======================================
// Delete activity
//======================================
const deleteActivity = async (activityId, userId) => {
  return await sequenceRepo.deleteActivity(activityId, userId);
};

//======================================
// Get work dashboard summary
//======================================
const getWorkDashboardSummary = async (userId) => {
  return await sequenceRepo.getWorkDashboardSummary(userId);
};

//======================================
// Get next activity
//======================================
const getNextActivity = async (userId, currentActivityId = null) => {
  return await sequenceRepo.getNextActivity(userId, currentActivityId);
};

//======================================
// Get activity metadata
//======================================
const getActivityMetadata = async () => {
  return await sequenceRepo.getActivityMetadata();
};

//======================================
// Helper: Sort activities
//======================================
const sortActivities = (activities, sortBy) => {
  const sorted = [...activities];
  
  switch (sortBy) {
    case 'priority':
      return sorted.sort((a, b) => {
        const priorityDiff = (b.PriorityLevelValue || 0) - (a.PriorityLevelValue || 0);
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(a.DueToStart) - new Date(b.DueToStart);
      });
    
    case 'account':
      return sorted.sort((a, b) => {
        const nameCompare = a.AccountName.localeCompare(b.AccountName);
        if (nameCompare !== 0) return nameCompare;
        return new Date(a.DueToStart) - new Date(b.DueToStart);
      });
    
    case 'type':
      return sorted.sort((a, b) => {
        const typeCompare = (a.ActivityTypeName || '').localeCompare(b.ActivityTypeName || '');
        if (typeCompare !== 0) return typeCompare;
        return new Date(a.DueToStart) - new Date(b.DueToStart);
      });
    
    case 'dueDate':
    default:
      return sorted.sort((a, b) => {
        const aOverdue = new Date(a.DueToStart) < new Date() ? 0 : 1;
        const bOverdue = new Date(b.DueToStart) < new Date() ? 0 : 1;
        if (aOverdue !== bOverdue) return aOverdue - bOverdue;
        return new Date(a.DueToStart) - new Date(b.DueToStart);
      });
  }
};

//======================================
// Helper: Filter activities
//======================================
const filterActivities = (activities, filter) => {
  switch (filter) {
    case 'overdue':
      return activities.filter(a => a.Status === 'overdue');
    
    case 'today':
      return activities.filter(a => a.Status === 'today');
    
    case 'high-priority':
      return activities.filter(a => (a.PriorityLevelValue || 0) >= 3);
    
    case 'all':
    default:
      return activities;
  }
};

module.exports = {
  getWorkPageActivities,
  getAccountActivitiesGrouped,
  getActivityByID,
  updateActivity,
  updateActivityDueDateWithCascade,
  completeActivityAndGetNext,
  deleteActivity,
  getWorkDashboardSummary,
  getNextActivity,
  getActivityMetadata,
};