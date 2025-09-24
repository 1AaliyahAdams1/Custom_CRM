const workRepo = require("../data/sequenceRepository");

//======================================
// Get activities with filtering
//======================================
const getActivities = async (userId, options = {}) => {
  return await workRepo.getActivities(userId, options);
};

//======================================
// Get activities by user
//======================================
const getActivitiesByUser = async (userId) => {
  return await workRepo.getActivitiesByUser(userId);
};

//======================================
// Get activity by ID
//======================================
const getActivityByID = async (activityId, userId) => {
  return await workRepo.getActivityByID(activityId, userId);
};

//======================================
// Update activity
//======================================
const updateActivity = async (activityId, userId, activityData) => {
  return await workRepo.updateActivity(activityId, userId, activityData);
};

//======================================
// Complete activity and get next
//======================================
const completeActivityAndGetNext = async (activityId, userId) => {
  return await workRepo.completeActivityAndGetNext(activityId, userId);
};

//======================================
// Delete activity
//======================================
const deleteActivity = async (activityId, userId) => {
  return await workRepo.deleteActivity(activityId, userId);
};

//======================================
// Get work dashboard summary
//======================================
const getWorkDashboardSummary = async (userId) => {
  return await workRepo.getWorkDashboardSummary(userId);
};

//======================================
// Get sequences and items by user
//======================================
const getSequencesAndItemsByUser = async (userId) => {
  return await workRepo.getSequencesAndItemsByUser(userId);
};

//======================================
// Get user sequences
//======================================
const getUserSequences = async (userId) => {
  return await workRepo.getUserSequences(userId);
};

//======================================
// Get next activity
//======================================
const getNextActivity = async (userId, currentActivityId = null) => {
  return await workRepo.getNextActivity(userId, currentActivityId);
};

//======================================
// Get activity metadata
//======================================
const getActivityMetadata = async () => {
  return await workRepo.getActivityMetadata();
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
      options.minPriority = 8;
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
  
  const activities = await workRepo.getActivities(userId, {
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
  getSequencesAndItemsByUser,
  getUserSequences,
  getNextActivity,
  getActivityMetadata,
  getSmartWorkPageData,
  parseFilterOptions,
};
    