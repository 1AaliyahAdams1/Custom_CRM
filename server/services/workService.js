const sequenceRepo = require("../data/sequenceRepository");

//======================================
// Get Work Page Data (Enhanced activities for UI)
//======================================
async function getWorkPageData(userId, sortCriteria = 'dueDate', filterCriteria = 'all') {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const allActivities = await sequenceRepo.getActivitiesByUser(userId);
    
    // Filter activities based on criteria
    let filteredActivities = allActivities;
    
    if (filterCriteria !== 'all') {
      filteredActivities = filterActivities(allActivities, filterCriteria);
    }

    // Work page specific logic: filter to incomplete only (unless filter is 'completed')
    if (filterCriteria !== 'completed') {
      filteredActivities = filteredActivities.filter(a => !a.Completed);
    }
    
    // Add work page specific enhancements
    const enhancedActivities = filteredActivities.map(activity => ({
      ...activity,
      Status: getActivityStatus(activity.DueToStart, activity.Completed),
      TimeUntilDue: getTimeUntilDue(activity.DueToStart),
      IsOverdue: new Date(activity.DueToStart) < new Date() && !activity.Completed,
      IsUrgent: isUrgent(activity.DueToStart, activity.Completed),
      IsHighPriority: activity.PriorityLevelValue >= 8
    }));
    
    // Apply work page specific sorting
    const sortedActivities = sortActivities(enhancedActivities, sortCriteria);
    
    // Group activities by status for UI
    const groupedActivities = {
      overdue: sortedActivities.filter(a => a.Status === 'overdue'),
      urgent: sortedActivities.filter(a => a.Status === 'urgent'),
      normal: sortedActivities.filter(a => a.Status === 'normal'),
      completed: sortedActivities.filter(a => a.Status === 'completed')
    };

    // Get summary statistics
    const summary = await sequenceRepo.getActivitiesSummary(userId);

    return {
      activities: sortedActivities,
      groupedActivities: groupedActivities,
      summary: summary,
      totalActivities: sortedActivities.length,
      overdueCount: groupedActivities.overdue.length,
      urgentCount: groupedActivities.urgent.length,
      completedCount: groupedActivities.completed.length
    };
  } catch (error) {
    console.error('Error in getWorkPageData:', error);
    throw new Error(`Failed to fetch work page data: ${error.message}`);
  }
}

//======================================
// Get Activity for Workspace Tab
//======================================
async function getActivityForWorkspace(activityId, userId) {
  try {
    if (!activityId || !userId) {
      throw new Error('Activity ID and User ID are required');
    }

    // Get activity with enhanced context
    const activity = await sequenceRepo.getActivityContext(activityId, userId);
    
    if (!activity) {
      throw new Error('Activity not found or access denied');
    }

    // Enhance with status information
    const enhancedActivity = {
      ...activity,
      Status: getActivityStatus(activity.DueToStart, activity.Completed),
      TimeUntilDue: getTimeUntilDue(activity.DueToStart),
      IsOverdue: new Date(activity.DueToStart) < new Date() && !activity.Completed,
      IsUrgent: isUrgent(activity.DueToStart, activity.Completed),
      IsHighPriority: activity.PriorityLevelValue >= 8,
      // Add sequence context
      HasSequence: !!activity.SequenceID,
      SequenceProgress: activity.DaysFromStart ? {
        current: activity.DaysFromStart,
        hasPrevious: !!activity.PrevSequenceItemID,
        hasNext: !!activity.NextSequenceItemID,
        previous: activity.PrevSequenceItemDescription,
        next: activity.NextSequenceItemDescription
      } : null
    };

    return enhancedActivity;
  } catch (error) {
    console.error('Error in getActivityForWorkspace:', error);
    throw new Error(`Failed to fetch activity for workspace: ${error.message}`);
  }
}

//======================================
// Complete Activity and Get Next (Enhanced)
//======================================
async function completeActivityAndGetNext(activityId, userId, notes = '') {
  try {
    if (!activityId || !userId) {
      throw new Error('Activity ID and User ID are required');
    }

    // Complete the activity
    const completionResult = await sequenceRepo.completeActivity(activityId, userId, notes);
    
    if (!completionResult.success) {
      throw new Error('Activity not found or already completed');
    }

    // Get next activity
    const nextActivity = await sequenceRepo.getNextActivity(userId, activityId);
    
    let enhancedNextActivity = null;
    if (nextActivity) {
      enhancedNextActivity = {
        ...nextActivity,
        Status: getActivityStatus(nextActivity.DueToStart, nextActivity.Completed),
        TimeUntilDue: getTimeUntilDue(nextActivity.DueToStart),
        IsOverdue: new Date(nextActivity.DueToStart) < new Date() && !nextActivity.Completed,
        IsUrgent: isUrgent(nextActivity.DueToStart, nextActivity.Completed),
        IsHighPriority: nextActivity.PriorityLevelValue >= 8
      };
    }

    return {
      completed: true,
      completedActivityId: activityId,
      nextActivity: enhancedNextActivity,
      hasMore: !!nextActivity
    };
  } catch (error) {
    console.error('Error in completeActivityAndGetNext:', error);
    throw new Error(`Failed to complete activity: ${error.message}`);
  }
}

//======================================
// Update Activity in Workspace
//======================================
async function updateActivityInWorkspace(activityId, userId, updateData) {
  try {
    if (!activityId || !userId) {
      throw new Error('Activity ID and User ID are required');
    }

    const updateResult = await sequenceRepo.updateActivity(activityId, userId, updateData);
    
    if (!updateResult.success) {
      throw new Error('Activity not found or update failed');
    }

    // Return updated activity with context
    const updatedActivity = await sequenceRepo.getActivityContext(activityId, userId);
    
    return {
      success: true,
      activity: {
        ...updatedActivity,
        Status: getActivityStatus(updatedActivity.DueToStart, updatedActivity.Completed),
        TimeUntilDue: getTimeUntilDue(updatedActivity.DueToStart),
        IsOverdue: new Date(updatedActivity.DueToStart) < new Date() && !updatedActivity.Completed,
        IsUrgent: isUrgent(updatedActivity.DueToStart, updatedActivity.Completed),
        IsHighPriority: updatedActivity.PriorityLevelValue >= 8
      }
    };
  } catch (error) {
    console.error('Error in updateActivityInWorkspace:', error);
    throw new Error(`Failed to update activity: ${error.message}`);
  }
}

//======================================
// Soft Delete Activity in Workspace
//======================================
async function deleteActivityInWorkspace(activityId, userId) {
  try {
    if (!activityId || !userId) {
      throw new Error('Activity ID and User ID are required');
    }

    const deleteResult = await sequenceRepo.softDeleteActivity(activityId, userId);
    
    if (!deleteResult.success) {
      throw new Error('Activity not found or delete failed');
    }

    // Get next activity to suggest
    const nextActivity = await sequenceRepo.getNextActivity(userId, activityId);
    
    let enhancedNextActivity = null;
    if (nextActivity) {
      enhancedNextActivity = {
        ...nextActivity,
        Status: getActivityStatus(nextActivity.DueToStart, nextActivity.Completed),
        TimeUntilDue: getTimeUntilDue(nextActivity.DueToStart),
        IsOverdue: new Date(nextActivity.DueToStart) < new Date() && !nextActivity.Completed,
        IsUrgent: isUrgent(nextActivity.DueToStart, nextActivity.Completed),
        IsHighPriority: nextActivity.PriorityLevelValue >= 8
      };
    }

    return {
      success: true,
      deletedActivityId: activityId,
      nextActivity: enhancedNextActivity
    };
  } catch (error) {
    console.error('Error in deleteActivityInWorkspace:', error);
    throw new Error(`Failed to delete activity: ${error.message}`);
  }
}

//======================================
// Get Activity Metadata (for editing forms)
//======================================
async function getActivityMetadata() {
  try {
    const [priorityLevels, activityTypes] = await Promise.all([
      sequenceRepo.getPriorityLevels(),
      sequenceRepo.getActivityTypes()
    ]);

    return {
      priorityLevels,
      activityTypes
    };
  } catch (error) {
    console.error('Error in getActivityMetadata:', error);
    throw new Error(`Failed to fetch activity metadata: ${error.message}`);
  }
}

//======================================
// Get User Sequences (for workspace context)
//======================================
async function getUserSequencesForWorkspace(userId) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const sequences = await sequenceRepo.getUserSequences(userId);
    const sequenceItems = await sequenceRepo.getSequencesandItemsByUser(userId);

    // Group sequence items by sequence
    const sequenceMap = {};
    sequences.forEach(seq => {
      sequenceMap[seq.SequenceID] = {
        ...seq,
        items: []
      };
    });

    sequenceItems.forEach(item => {
      if (sequenceMap[item.SequenceID]) {
        sequenceMap[item.SequenceID].items.push(item);
      }
    });

    return Object.values(sequenceMap);
  } catch (error) {
    console.error('Error in getUserSequencesForWorkspace:', error);
    throw new Error(`Failed to fetch user sequences: ${error.message}`);
  }
}

//======================================
// Get Day View Activities
//======================================
async function getDayViewActivities(userId, date = new Date()) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const allActivities = await sequenceRepo.getActivitiesByUser(userId);
    
    // Filter for specific day
    const dayActivities = allActivities.filter(activity => {
      const activityDate = new Date(activity.DueToStart);
      return activityDate.toDateString() === date.toDateString();
    });

    // Group by hour for calendar view
    const hourlyGroups = {};
    dayActivities.forEach(activity => {
      const hour = new Date(activity.DueToStart).getHours();
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
      if (!hourlyGroups[timeSlot]) {
        hourlyGroups[timeSlot] = [];
      }
      hourlyGroups[timeSlot].push({
        ...activity,
        Status: getActivityStatus(activity.DueToStart, activity.Completed),
        TimeUntilDue: getTimeUntilDue(activity.DueToStart)
      });
    });

    return {
      date: date,
      activities: dayActivities,
      hourlyGroups: hourlyGroups,
      totalCount: dayActivities.length,
      completedCount: dayActivities.filter(a => a.Completed).length,
      pendingCount: dayActivities.filter(a => !a.Completed).length
    };
  } catch (error) {
    console.error('Error in getDayViewActivities:', error);
    throw new Error(`Failed to fetch day view activities: ${error.message}`);
  }
}

//======================================
// Get Activities by Status Filter
//======================================
async function getActivitiesByStatus(userId, status) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const allActivities = await sequenceRepo.getActivitiesByUser(userId);
    
    const enhancedActivities = allActivities.map(activity => ({
      ...activity,
      Status: getActivityStatus(activity.DueToStart, activity.Completed),
      TimeUntilDue: getTimeUntilDue(activity.DueToStart),
      IsOverdue: new Date(activity.DueToStart) < new Date() && !activity.Completed,
      IsUrgent: isUrgent(activity.DueToStart, activity.Completed),
      IsHighPriority: activity.PriorityLevelValue >= 8
    }));

    if (status === 'all') {
      return enhancedActivities;
    }
    
    return enhancedActivities.filter(a => {
      if (status === 'pending') return !a.Completed;
      return a.Status === status;
    });
  } catch (error) {
    console.error('Error in getActivitiesByStatus:', error);
    throw new Error(`Failed to fetch activities by status: ${error.message}`);
  }
}

//======================================
// Get Next Activity (Enhanced workflow)
//======================================
async function getNextActivityForWorkflow(userId, currentActivityId = null) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const nextActivity = await sequenceRepo.getNextActivity(userId, currentActivityId);
    
    if (!nextActivity) {
      return null;
    }

    // Enhance with status information
    const enhancedNextActivity = {
      ...nextActivity,
      Status: getActivityStatus(nextActivity.DueToStart, nextActivity.Completed),
      TimeUntilDue: getTimeUntilDue(nextActivity.DueToStart),
      IsOverdue: new Date(nextActivity.DueToStart) < new Date() && !nextActivity.Completed,
      IsUrgent: isUrgent(nextActivity.DueToStart, nextActivity.Completed),
      IsHighPriority: nextActivity.PriorityLevelValue >= 8
    };

    return enhancedNextActivity;
  } catch (error) {
    console.error('Error in getNextActivityForWorkflow:', error);
    throw new Error(`Failed to fetch next activity: ${error.message}`);
  }
}

//======================================
// Smart Work Dashboard Summary
//======================================
async function getWorkDashboardSummary(userId) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const [summary, sequences] = await Promise.all([
      sequenceRepo.getActivitiesSummary(userId),
      sequenceRepo.getUserSequences(userId)
    ]);

    // Get recent activities
    const recentActivities = await sequenceRepo.getActivitiesByUser(userId);
    const recentCompleted = recentActivities
      .filter(a => a.Completed)
      .sort((a, b) => new Date(b.ActivityUpdated) - new Date(a.ActivityUpdated))
      .slice(0, 5);

    return {
      summary,
      sequences: sequences.length,
      recentCompleted: recentCompleted.map(activity => ({
        ...activity,
        TimeCompleted: getTimeSince(activity.ActivityUpdated)
      })),
      workflowReady: summary.PendingActivities > 0
    };
  } catch (error) {
    console.error('Error in getWorkDashboardSummary:', error);
    throw new Error(`Failed to fetch work dashboard summary: ${error.message}`);
  }
}

//======================================
// Helper Functions for Work Page Logic
//======================================
function getActivityStatus(dueDate, completed) {
  if (completed) return 'completed';
  
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
  
  if (diffMs < 0) {
    const overdueDays = Math.floor(Math.abs(diffMs) / (24 * 60 * 60 * 1000));
    if (overdueDays > 0) return `${overdueDays}d overdue`;
    const overdueHours = Math.floor(Math.abs(diffMs) / (60 * 60 * 1000));
    if (overdueHours > 0) return `${overdueHours}h overdue`;
    return 'Overdue';
  }
  
  if (diffMs < 60 * 60 * 1000) return `${Math.floor(diffMs / (60 * 1000))}m`;
  if (diffMs < 24 * 60 * 60 * 1000) return `${Math.floor(diffMs / (60 * 60 * 1000))}h`;
  return `${Math.floor(diffMs / (24 * 60 * 60 * 1000))}d`;
}

function getTimeSince(date) {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  
  if (diffMs < 60 * 60 * 1000) return `${Math.floor(diffMs / (60 * 1000))}m ago`;
  if (diffMs < 24 * 60 * 60 * 1000) return `${Math.floor(diffMs / (60 * 60 * 1000))}h ago`;
  return `${Math.floor(diffMs / (24 * 60 * 60 * 1000))}d ago`;
}

function isUrgent(dueDate, completed) {
  if (completed) return false;
  const now = new Date();
  const due = new Date(dueDate);
  return due <= new Date(now.getTime() + 2 * 60 * 60 * 1000) && due >= now; // 2 hours
}

function filterActivities(activities, filterCriteria) {
  switch(filterCriteria) {
    case 'overdue':
      return activities.filter(a => new Date(a.DueToStart) < new Date() && !a.Completed);
    case 'urgent':
      return activities.filter(a => isUrgent(a.DueToStart, a.Completed));
    case 'high-priority':
      return activities.filter(a => a.PriorityLevelValue >= 8 && !a.Completed);
    case 'completed':
      return activities.filter(a => a.Completed);
    case 'today':
      const today = new Date();
      return activities.filter(a => {
        const activityDate = new Date(a.DueToStart);
        return activityDate.toDateString() === today.toDateString();
      });
    case 'pending':
      return activities.filter(a => !a.Completed);
    default:
      return activities;
  }
}

function sortActivities(activities, sortCriteria) {
  switch(sortCriteria) {
    case 'priority':
      return activities.sort((a, b) => {
        // First sort by overdue status
        const aOverdue = new Date(a.DueToStart) < new Date() && !a.Completed ? 0 : 1;
        const bOverdue = new Date(b.DueToStart) < new Date() && !b.Completed ? 0 : 1;
        if (aOverdue !== bOverdue) return aOverdue - bOverdue;
        // Then by priority value
        return b.PriorityLevelValue - a.PriorityLevelValue;
      });
    case 'overdue':
      return activities.sort((a, b) => {
        const aOverdue = new Date(a.DueToStart) < new Date() && !a.Completed ? 0 : 1;
        const bOverdue = new Date(b.DueToStart) < new Date() && !b.Completed ? 0 : 1;
        return aOverdue - bOverdue || new Date(a.DueToStart) - new Date(b.DueToStart);
      });
    case 'account':
      return activities.sort((a, b) => a.AccountName.localeCompare(b.AccountName));
    case 'type':
      return activities.sort((a, b) => a.ActivityTypeName.localeCompare(b.ActivityTypeName));
    case 'sequence':
      return activities.sort((a, b) => {
        if (!a.SequenceName && !b.SequenceName) return 0;
        if (!a.SequenceName) return 1;
        if (!b.SequenceName) return -1;
        return a.SequenceName.localeCompare(b.SequenceName);
      });
    default: // 'dueDate'
      return activities.sort((a, b) => {
        // Overdue items first
        const aOverdue = new Date(a.DueToStart) < new Date() && !a.Completed ? 0 : 1;
        const bOverdue = new Date(b.DueToStart) < new Date() && !b.Completed ? 0 : 1;
        if (aOverdue !== bOverdue) return aOverdue - bOverdue;
        // Then by due date
        return new Date(a.DueToStart) - new Date(b.DueToStart);
      });
  }
}

module.exports = {
  getWorkPageData,
  getActivityForWorkspace,
  completeActivityAndGetNext,
  updateActivityInWorkspace,
  deleteActivityInWorkspace,
  getDayViewActivities,
  getActivitiesByStatus,
  getNextActivityForWorkflow,
  getActivityMetadata,
  getUserSequencesForWorkspace,
  getWorkDashboardSummary
};