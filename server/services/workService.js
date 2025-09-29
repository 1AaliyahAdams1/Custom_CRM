const sequenceRepo = require("../data/sequenceRepository");

//======================================
// Get activities with filtering
//======================================
const getActivities = async (userId, options = {}) => {
  return await sequenceRepo.getActivities(userId, options);
};

//======================================
// Get activities by user
//======================================
const getActivitiesByUser = async (userId) => {
  return await sequenceRepo.getActivitiesByUser(userId);
};

//======================================
// Get activity by ID
//======================================
const getActivityByID = async (activityId, userId) => {
  return await sequenceRepo.getActivityByID(activityId, userId);
};

//======================================
// Get activity for workspace (detailed view)
//======================================
const getActivityForWorkspace = async (activityId, userId) => {
  return await sequenceRepo.getActivityByID(activityId, userId);
};

//======================================
// Update activity
//======================================
const updateActivity = async (activityId, userId, activityData) => {
  return await sequenceRepo.updateActivity(activityId, userId, activityData);
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
// Helper function to parse filter options
//======================================
const parseFilterOptions = (filterString) => {
  const options = {};
  
  switch (filterString) {
    case 'overdue':
      options.completed = false;
      break;
    case 'urgent':
      options.completed = false;
      break;
    case 'high-priority':
      options.completed = false;
      options.minPriority = 3;
      break;
    case 'completed':
      options.completed = true;
      break;
    case 'pending':
      options.completed = false;
      break;
    case 'today':
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);
      options.dateFrom = today;
      options.dateTo = endOfToday;
      break;
    default:
      // 'all' - no additional filters
      break;
  }
  
  return options;
};

//======================================
// Get activities with smart filtering (main work page)
//======================================
const getSmartWorkPageData = async (userId, options = {}) => {
  const filterOptions = parseFilterOptions(options.filter);
  const sortBy = options.sort || 'dueDate';
  
  const activities = await sequenceRepo.getActivities(userId, {
    ...filterOptions,
    sortBy: sortBy
  });
  
  return {
    activities,
    totalActivities: activities.length,
    appliedFilters: {
      filter: options.filter || 'all',
      sort: sortBy
    }
  };
};

module.exports = {
  getActivities,
  getActivitiesByUser,
  getActivityByID,
  updateActivity,
  completeActivityAndGetNext,
  deleteActivity,
  getWorkDashboardSummary,
  getNextActivity,
  getActivityMetadata,
  getSmartWorkPageData,
  getActivityForWorkspace,
  parseFilterOptions,
};