const sequenceRepo = require("../data/sequenceRepository");

const userId = 1;

//======================================
// Get Work Page Data (Enhanced activities for UI)
//======================================
async function getWorkPageData(userId, sortCriteria = 'dueDate') {
  try {
    const allActivities = await sequenceRepo.getActivitiesByUser(userId);
    
    // Work page specific logic: filter to incomplete only
    const incompleteActivities = allActivities.filter(a => !a.Completed);
    
    // Add work page specific enhancements
    const enhancedActivities = incompleteActivities.map(activity => ({
      ...activity,
      Status: getActivityStatus(activity.DueToStart),
      TimeUntilDue: getTimeUntilDue(activity.DueToStart)
    }));
    
    // Apply work page specific sorting
    const sortedActivities = sortActivities(enhancedActivities, sortCriteria);
    
    // Group activities by status for UI
    const groupedActivities = {
      overdue: sortedActivities.filter(a => a.Status === 'overdue'),
      urgent: sortedActivities.filter(a => a.Status === 'urgent'),
      normal: sortedActivities.filter(a => a.Status === 'normal')
    };

    // Get sequences for context
    const sequences = await sequenceRepo.getUserSequences(userId);

    return {
      activities: sortedActivities,
      groupedActivities: groupedActivities,
      sequences: sequences,
      totalActivities: sortedActivities.length,
      overdueCount: groupedActivities.overdue.length,
      urgentCount: groupedActivities.urgent.length
    };
  } catch (error) {
    console.error('Error in getWorkPageData:', error);
    throw new Error('Failed to fetch work page data');
  }
}

//======================================
// Complete Activity and Get Next
//======================================
async function completeActivityAndGetNext(activityId, userId, notes = '') {
  try {
    // Complete the activity (uses function that needs to be added to sequences repo)
    const completionResult = await sequenceRepo.completeActivity(activityId, userId, notes);
    
    if (!completionResult.success) {
      throw new Error('Activity not found or already completed');
    }

    // Get next activity using existing repo, then filter and sort
    const allActivities = await sequenceRepo.getActivitiesByUser(userId);
    const incompleteActivities = allActivities.filter(a => !a.Completed);
    const sortedActivities = incompleteActivities.sort((a, b) => {
      // Sort by due date first, then priority
      const dateComparison = new Date(a.DueToStart) - new Date(b.DueToStart);
      if (dateComparison !== 0) return dateComparison;
      return b.PriorityLevelValue - a.PriorityLevelValue;
    });
    
    const nextActivity = sortedActivities[0] || null;

    return {
      completed: true,
      nextActivity: nextActivity,
      hasMore: !!nextActivity
    };
  } catch (error) {
    console.error('Error in completeActivityAndGetNext:', error);
    throw new Error('Failed to complete activity');
  }
}

//======================================
// Get Day View Activities
//======================================
async function getDayViewActivities(userId, date = new Date()) {
  try {
    // Use existing repo to get all activities
    const allActivities = await sequenceRepo.getActivitiesByUser(userId);
    
    // Filter for specific day and incomplete only
    const dayActivities = allActivities.filter(activity => {
      const activityDate = new Date(activity.DueToStart);
      return activityDate.toDateString() === date.toDateString() && !activity.Completed;
    });

    // Group by hour for calendar view
    const hourlyGroups = {};
    dayActivities.forEach(activity => {
      const hour = new Date(activity.DueToStart).getHours();
      const timeSlot = `${hour}:00`;
      if (!hourlyGroups[timeSlot]) {
        hourlyGroups[timeSlot] = [];
      }
      hourlyGroups[timeSlot].push(activity);
    });

    return {
      date: date,
      activities: dayActivities,
      hourlyGroups: hourlyGroups,
      totalCount: dayActivities.length
    };
  } catch (error) {
    console.error('Error in getDayViewActivities:', error);
    throw new Error('Failed to fetch day view activities');
  }
}

//======================================
// Update Activity Order (for drag & drop)
//======================================
async function updateActivityOrder(userId, activityOrderData) {
  try {
    // This would need to be added to sequences repo
    const result = await sequenceRepo.updateActivityOrder(userId, activityOrderData);
    return result;
  } catch (error) {
    console.error('Error in updateActivityOrder:', error);
    throw new Error('Failed to update activity order');
  }
}

//======================================
// Get Activities by Status Filter
//======================================
async function getActivitiesByStatus(userId, status) {
  try {
    const allActivities = await sequenceRepo.getActivitiesByUser(userId);
    const incompleteActivities = allActivities.filter(a => !a.Completed);
    
    const enhancedActivities = incompleteActivities.map(activity => ({
      ...activity,
      Status: getActivityStatus(activity.DueToStart)
    }));

    if (status === 'all') {
      return enhancedActivities;
    }
    
    return enhancedActivities.filter(a => a.Status === status);
  } catch (error) {
    console.error('Error in getActivitiesByStatus:', error);
    throw new Error('Failed to fetch activities by status');
  }
}

//======================================
// Helper Functions for Work Page Logic
//======================================
function getActivityStatus(dueDate) {
  const now = new Date();
  const due = new Date(dueDate);
  
  if (due < now) return 'overdue';
  if (due <= new Date(now.getTime() + 2 * 60 * 60 * 1000)) return 'urgent'; // 2 hours
  return 'normal';
}

function getTimeUntilDue(dueDate) {
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due - now;
  
  if (diffMs < 0) return 'Overdue';
  if (diffMs < 60 * 60 * 1000) return `${Math.floor(diffMs / (60 * 1000))}m`;
  if (diffMs < 24 * 60 * 60 * 1000) return `${Math.floor(diffMs / (60 * 60 * 1000))}h`;
  return `${Math.floor(diffMs / (24 * 60 * 60 * 1000))}d`;
}

function sortActivities(activities, sortCriteria) {
  switch(sortCriteria) {
    case 'priority':
      return activities.sort((a, b) => b.PriorityLevelValue - a.PriorityLevelValue);
    case 'overdue':
      return activities.sort((a, b) => {
        const aOverdue = new Date(a.DueToStart) < new Date() ? 0 : 1;
        const bOverdue = new Date(b.DueToStart) < new Date() ? 0 : 1;
        return aOverdue - bOverdue || new Date(a.DueToStart) - new Date(b.DueToStart);
      });
    case 'account':
      return activities.sort((a, b) => a.AccountName.localeCompare(b.AccountName));
    default: // 'dueDate'
      return activities.sort((a, b) => new Date(a.DueToStart) - new Date(b.DueToStart));
  }
}

module.exports = {
  getWorkPageData,
  completeActivityAndGetNext,
  getDayViewActivities,
  updateActivityOrder,
  getActivitiesByStatus
};