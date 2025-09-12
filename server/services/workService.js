const sequenceRepo = require("../data/sequenceRepository");

//======================================
// Get Smart Work Page Data
//======================================
async function getSmartWorkPageData(userId, options = {}) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Parse filter and sort options
    const filterOptions = parseFilterOptions(options.filter);
    const sortBy = options.sort || 'dueDate';
    
    // Get activities with database-level filtering
    const activities = await sequenceRepo.getActivities(userId, {
      ...filterOptions,
      sortBy: sortBy
    });
    
    // Enhance activities with client-side calculations
    const enhancedActivities = activities.map(activity => ({
      ...activity,
      TimeUntilDue: calculateTimeUntilDue(activity.DueToStart, activity.Completed),
      HasSequence: !!activity.SequenceID,
      SequenceProgress: activity.DaysFromStart ? {
        current: activity.DaysFromStart,
        sequenceName: activity.SequenceName
      } : null
    }));

    // Group activities by status for buckets
    const buckets = groupActivitiesByStatus(enhancedActivities);
    
    // Calculate counts
    const counts = calculateActivityCounts(enhancedActivities);

    return {
      activities: enhancedActivities,
      buckets: buckets,
      counts: counts,
      totalActivities: enhancedActivities.length,
      appliedFilters: {
        filter: options.filter || 'all',
        sort: sortBy
      }
    };
  } catch (error) {
    console.error('Error in getSmartWorkPageData:', error);
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

    const activity = await sequenceRepo.getActivityContext(activityId, userId);
    
    if (!activity) {
      throw new Error('Activity not found or access denied');
    }

    // Enhance activity with workspace-specific data
    const enhancedActivity = {
      ...activity,
      TimeUntilDue: calculateTimeUntilDue(activity.DueToStart, activity.Completed),
      HasSequence: !!activity.SequenceID,
      SequenceProgress: activity.DaysFromStart ? {
        current: activity.DaysFromStart,
        sequenceName: activity.SequenceName,
        hasPrevious: !!activity.PrevSequenceItemID,
        hasNext: !!activity.NextSequenceItemID,
        previous: {
          id: activity.PrevSequenceItemID,
          description: activity.PrevSequenceItemDescription,
          days: activity.PrevDaysFromStart
        },
        next: {
          id: activity.NextSequenceItemID,
          description: activity.NextSequenceItemDescription,
          days: activity.NextDaysFromStart
        }
      } : null,
      CanEdit: !activity.Completed,
      CanComplete: !activity.Completed,
      CanDelete: true
    };

    return enhancedActivity;
  } catch (error) {
    console.error('Error in getActivityForWorkspace:', error);
    throw new Error(`Failed to fetch activity for workspace: ${error.message}`);
  }
}

//======================================
// Complete Activity and Get Next (Workflow)
//======================================
async function completeActivityWorkflow(activityId, userId, notes = '') {
  try {
    if (!activityId || !userId) {
      throw new Error('Activity ID and User ID are required');
    }

    const result = await sequenceRepo.completeActivityAndGetNext(activityId, userId, notes);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to complete activity');
    }

    // Enhance next activity if available
    let enhancedNextActivity = null;
    if (result.nextActivity) {
      enhancedNextActivity = {
        ...result.nextActivity,
        TimeUntilDue: calculateTimeUntilDue(result.nextActivity.DueToStart, result.nextActivity.Completed),
        HasSequence: !!result.nextActivity.SequenceID,
        SequenceProgress: result.nextActivity.DaysFromStart ? {
          current: result.nextActivity.DaysFromStart,
          sequenceName: result.nextActivity.SequenceName
        } : null
      };
    }

    return {
      success: true,
      completedActivityId: result.completedActivityId,
      nextActivity: enhancedNextActivity,
      hasMore: !!enhancedNextActivity,
      workflowContinues: !!enhancedNextActivity
    };
  } catch (error) {
    console.error('Error in completeActivityWorkflow:', error);
    throw new Error(`Failed to complete activity: ${error.message}`);
  }
}

//======================================
// Update Activity in Workspace
//======================================
async function updateActivityWorkspace(activityId, userId, updateData) {
  try {
    if (!activityId || !userId) {
      throw new Error('Activity ID and User ID are required');
    }

    // Validate update data
    const validatedData = validateUpdateData(updateData);
    
    const updateResult = await sequenceRepo.updateActivity(activityId, userId, validatedData);
    
    if (!updateResult.success) {
      throw new Error('Activity not found or update failed');
    }

    // Return updated activity with context
    const updatedActivity = await sequenceRepo.getActivityContext(activityId, userId);
    
    return {
      success: true,
      activity: {
        ...updatedActivity,
        TimeUntilDue: calculateTimeUntilDue(updatedActivity.DueToStart, updatedActivity.Completed),
        HasSequence: !!updatedActivity.SequenceID,
        SequenceProgress: updatedActivity.DaysFromStart ? {
          current: updatedActivity.DaysFromStart,
          sequenceName: updatedActivity.SequenceName
        } : null
      }
    };
  } catch (error) {
    console.error('Error in updateActivityWorkspace:', error);
    throw new Error(`Failed to update activity: ${error.message}`);
  }
}

//======================================
// Delete Activity in Workspace
//======================================
async function deleteActivityWorkspace(activityId, userId) {
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
        TimeUntilDue: calculateTimeUntilDue(nextActivity.DueToStart, nextActivity.Completed),
        HasSequence: !!nextActivity.SequenceID
      };
    }

    return {
      success: true,
      deletedActivityId: activityId,
      nextActivity: enhancedNextActivity
    };
  } catch (error) {
    console.error('Error in deleteActivityWorkspace:', error);
    throw new Error(`Failed to delete activity: ${error.message}`);
  }
}

//======================================
// Get Work Dashboard Summary
//======================================
async function getWorkDashboard(userId) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const [summary, sequences, recentActivities] = await Promise.all([
      sequenceRepo.getWorkDashboardSummary(userId),
      sequenceRepo.getUserSequences(userId),
      sequenceRepo.getActivities(userId, { completed: true, sortBy: 'dueDate' })
    ]);

    // Get recent completed activities (last 5)
    const recentCompleted = recentActivities
      .filter(a => a.Completed)
      .slice(0, 5)
      .map(activity => ({
        ...activity,
        TimeCompleted: calculateTimeSince(activity.DueToEnd || activity.DueToStart)
      }));

    // Calculate productivity metrics
    const productivityMetrics = {
      completionRate: summary.TotalActivities > 0 ? 
        Math.round((summary.CompletedActivities / summary.TotalActivities) * 100) : 0,
      overdueRate: summary.PendingActivities > 0 ? 
        Math.round((summary.OverdueActivities / summary.PendingActivities) * 100) : 0,
      urgentRate: summary.PendingActivities > 0 ? 
        Math.round((summary.UrgentActivities / summary.PendingActivities) * 100) : 0
    };

    return {
      summary: {
        ...summary,
        ...productivityMetrics
      },
      sequenceCount: sequences.length,
      recentCompleted,
      workflowReady: summary.PendingActivities > 0,
      needsAttention: summary.OverdueActivities > 0 || summary.UrgentActivities > 0
    };
  } catch (error) {
    console.error('Error in getWorkDashboard:', error);
    throw new Error(`Failed to fetch work dashboard: ${error.message}`);
  }
}

//======================================
// Get Next Activity for Workflow
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

    return {
      ...nextActivity,
      TimeUntilDue: calculateTimeUntilDue(nextActivity.DueToStart, nextActivity.Completed),
      HasSequence: !!nextActivity.SequenceID,
      SequenceProgress: nextActivity.DaysFromStart ? {
        current: nextActivity.DaysFromStart,
        sequenceName: nextActivity.SequenceName
      } : null,
      WorkflowPosition: 'next'
    };
  } catch (error) {
    console.error('Error in getNextActivityForWorkflow:', error);
    throw new Error(`Failed to fetch next activity: ${error.message}`);
  }
}

//======================================
// Get Activity Metadata
//======================================
async function getActivityMetadata() {
  try {
    const metadata = await sequenceRepo.getActivityMetadata();
    
    return {
      priorityLevels: metadata.priorityLevels.map(pl => ({
        ...pl,
        IsHigh: pl.PriorityLevelValue >= 8,
        IsMedium: pl.PriorityLevelValue >= 5 && pl.PriorityLevelValue < 8,
        IsLow: pl.PriorityLevelValue < 5
      })),
      activityTypes: metadata.activityTypes
    };
  } catch (error) {
    console.error('Error in getActivityMetadata:', error);
    throw new Error(`Failed to fetch activity metadata: ${error.message}`);
  }
}

//======================================
// Get User Sequences for Context
//======================================
async function getUserSequencesForContext(userId) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const sequences = await sequenceRepo.getUserSequences(userId);
    
    return sequences.map(seq => ({
      ...seq,
      IsActive: seq.SequenceActive === 1,
      AccountContext: {
        id: seq.AccountID,
        name: seq.AccountName
      }
    }));
  } catch (error) {
    console.error('Error in getUserSequencesForContext:', error);
    throw new Error(`Failed to fetch user sequences: ${error.message}`);
  }
}

//======================================
// Get Activities by Status Filter
//======================================
async function getActivitiesByStatusFilter(userId, statusFilter) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const filterOptions = parseFilterOptions(statusFilter);
    const activities = await sequenceRepo.getActivities(userId, filterOptions);
    
    const enhancedActivities = activities.map(activity => ({
      ...activity,
      TimeUntilDue: calculateTimeUntilDue(activity.DueToStart, activity.Completed),
      HasSequence: !!activity.SequenceID
    }));

    return {
      activities: enhancedActivities,
      filter: statusFilter,
      count: enhancedActivities.length,
      buckets: groupActivitiesByStatus(enhancedActivities)
    };
  } catch (error) {
    console.error('Error in getActivitiesByStatusFilter:', error);
    throw new Error(`Failed to fetch activities by status: ${error.message}`);
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

    // Set date range for the specific day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const activities = await sequenceRepo.getActivities(userId, {
      dateFrom: startOfDay,
      dateTo: endOfDay,
      sortBy: 'dueDate'
    });

    // Group activities by hour
    const hourlyGroups = {};
    activities.forEach(activity => {
      const hour = new Date(activity.DueToStart).getHours();
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
      
      if (!hourlyGroups[timeSlot]) {
        hourlyGroups[timeSlot] = [];
      }
      
      hourlyGroups[timeSlot].push({
        ...activity,
        TimeUntilDue: calculateTimeUntilDue(activity.DueToStart, activity.Completed)
      });
    });

    return {
      date: date.toDateString(),
      activities: activities,
      hourlyGroups: hourlyGroups,
      totalCount: activities.length,
      completedCount: activities.filter(a => a.Completed).length,
      pendingCount: activities.filter(a => !a.Completed).length
    };
  } catch (error) {
    console.error('Error in getDayViewActivities:', error);
    throw new Error(`Failed to fetch day view activities: ${error.message}`);
  }
}

//======================================
// Mark Activity as Complete (Simple)
//======================================
async function markActivityComplete(activityId, userId) {
  try {
    if (!activityId || !userId) {
      throw new Error('Activity ID and User ID are required');
    }

    const updateResult = await sequenceRepo.updateActivity(activityId, userId, { completed: 1 });
    
    if (!updateResult.success) {
      throw new Error('Activity not found or completion failed');
    }

    return {
      success: true,
      completedActivityId: activityId
    };
  } catch (error) {
    console.error('Error in markActivityComplete:', error);
    throw new Error(`Failed to mark activity as complete: ${error.message}`);
  }
}

//======================================
// Helper Functions
//======================================

function parseFilterOptions(filterString) {
  const options = {};
  
  switch (filterString) {
    case 'overdue':
      options.completed = false;
      // Additional overdue logic handled in SQL
      break;
    case 'urgent':
      options.completed = false;
      // Additional urgent logic handled in SQL
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
}

function groupActivitiesByStatus(activities) {
  return {
    overdue: activities.filter(a => a.Status === 'overdue'),
    urgent: activities.filter(a => a.Status === 'urgent'),
    normal: activities.filter(a => a.Status === 'normal'),
    completed: activities.filter(a => a.Status === 'completed')
  };
}

function calculateActivityCounts(activities) {
  return {
    total: activities.length,
    overdue: activities.filter(a => a.IsOverdue === 1).length,
    urgent: activities.filter(a => a.IsUrgent === 1).length,
    highPriority: activities.filter(a => a.IsHighPriority === 1).length,
    completed: activities.filter(a => a.Completed === 1).length,
    pending: activities.filter(a => a.Completed === 0).length
  };
}

function calculateTimeUntilDue(dueDate, completed) {
  if (completed) return 'Completed';
  
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
  
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (days > 0) return `${days}d`;
  
  const hours = Math.floor(diffMs / (60 * 60 * 1000));
  if (hours > 0) return `${hours}h`;
  
  const minutes = Math.floor(diffMs / (60 * 1000));
  return `${minutes}m`;
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

function calculateTimeSince(date) {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (days > 0) return `${days}d ago`;
  
  const hours = Math.floor(diffMs / (60 * 60 * 1000));
  if (hours > 0) return `${hours}h ago`;
  
  const minutes = Math.floor(diffMs / (60 * 1000));
  return `${minutes}m ago`;
}

function validateUpdateData(updateData) {
  const validatedData = {};
  
  if (updateData.dueToStart) {
    const dueDate = new Date(updateData.dueToStart);
    if (isNaN(dueDate.getTime())) {
      throw new Error('Invalid due start date');
    }
    validatedData.dueToStart = dueDate;
  }
  
  if (updateData.dueToEnd) {
    const endDate = new Date(updateData.dueToEnd);
    if (isNaN(endDate.getTime())) {
      throw new Error('Invalid due end date');
    }
    validatedData.dueToEnd = endDate;
  }
  
  if (updateData.priorityLevelId !== undefined) {
    const priorityId = parseInt(updateData.priorityLevelId);
    if (isNaN(priorityId) || priorityId < 1) {
      throw new Error('Invalid priority level ID');
    }
    validatedData.priorityLevelId = priorityId;
  }

  if (updateData.completed !== undefined) {
    validatedData.completed = updateData.completed ? 1 : 0;
  }
  
  if (Object.keys(validatedData).length === 0) {
    throw new Error('No valid update data provided');
  }
  
  return validatedData;
}

module.exports = {
  getSmartWorkPageData,
  getActivityForWorkspace,
  completeActivityWorkflow,
  updateActivityWorkspace,
  deleteActivityWorkspace,
  getWorkDashboard,
  getNextActivityForWorkflow,
  getActivityMetadata,
  getUserSequencesForContext,
  getActivitiesByStatusFilter,
  getDayViewActivities,
  markActivityComplete
};