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
// Get account sequence view with activities
//======================================
const getAccountSequenceView = async (accountId, userId) => {
  const rawData = await sequenceRepo.getAccountSequenceWithActivities(accountId, userId);
  
  if (!rawData || rawData.length === 0) {
    return null;
  }

  const firstRow = rawData[0];
  
  // Calculate progress
  const totalSteps = rawData.length;
  const completedSteps = rawData.filter(row => row.Status === 'completed').length;
  const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // Transform into structured response
  const sequenceView = {
    account: {
      AccountID: firstRow.AccountID,
      AccountName: firstRow.AccountName,
      AccountCreatedAt: firstRow.AccountCreatedAt
    },
    sequence: {
      SequenceID: firstRow.SequenceID,
      SequenceName: firstRow.SequenceName,
      SequenceDescription: firstRow.SequenceDescription
    },
    progress: {
      totalSteps,
      completedSteps,
      progressPercentage
    },
    steps: rawData.map((row, index) => ({
      stepNumber: index + 1,
      SequenceItemID: row.SequenceItemID,
      SequenceItemDescription: row.SequenceItemDescription,
      DaysFromStart: row.DaysFromStart,
      ActivityTypeID: row.ActivityTypeID, // Changed from TypeID
      ActivityTypeName: row.ActivityTypeName,
      ActivityTypeDescription: row.ActivityTypeDescription,
      PriorityLevelID: row.PriorityLevelID,
      PriorityLevelName: row.PriorityLevelName,
      PriorityLevelValue: row.PriorityLevelValue,
      ActivityID: row.ActivityID,
      DueToStart: row.DueToStart,
      DueToEnd: row.DueToEnd,
      Completed: row.Completed,
      Status: row.Status,
      estimatedDueDate: row.DueToStart || calculateEstimatedDueDate(firstRow.AccountCreatedAt, row.DaysFromStart)
    }))
  };

  return sequenceView;
};

//======================================
// Helper: Calculate estimated due date from account start
//======================================
const calculateEstimatedDueDate = (accountCreatedAt, daysFromStart) => {
  if (!accountCreatedAt || daysFromStart === null || daysFromStart === undefined) {
    return null;
  }
  
  const startDate = new Date(accountCreatedAt);
  const estimatedDate = new Date(startDate);
  estimatedDate.setDate(estimatedDate.getDate() + daysFromStart);
  
  return estimatedDate;
};

//======================================
// Get activities with smart filtering (main work page)
//======================================
const getSmartWorkPageData = async (userId, options = {}) => {
  // If accountId is provided, return sequence view instead
  if (options.accountId) {
    const sequenceView = await getAccountSequenceView(options.accountId, userId);
    
    if (!sequenceView) {
      throw new Error("Account not found, has no sequence assigned, or user does not have access");
    }
    
    return {
      mode: 'sequence',
      data: sequenceView
    };
  }
  
  // Otherwise, return regular activity list
  const filterOptions = parseFilterOptions(options.filter);
  const sortBy = options.sort || 'dueDate';
  
  const activities = await sequenceRepo.getActivities(userId, {
    ...filterOptions,
    sortBy: sortBy
  });
  
  return {
    mode: 'activities',
    data: {
      activities,
      totalActivities: activities.length,
      appliedFilters: {
        filter: options.filter || 'all',
        sort: sortBy
      }
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
  getAccountSequenceView,
};