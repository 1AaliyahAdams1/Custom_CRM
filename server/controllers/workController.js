const workService = require("../services/workService");
const sequenceRepo = require("../data/sequenceRepository");

// Get work page activities with sorting and filtering
async function getActivities(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const sortCriteria = req.query.sort || 'dueDate';
    const filterCriteria = req.query.filter || 'all';

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ 
        error: 'Valid User ID is required',
        received: req.params.userId
      });
    }

    console.log(`Fetching work page data for user ${userId} with sort: ${sortCriteria}, filter: ${filterCriteria}`);
    
    const workPageData = await workService.getWorkPageData(userId, sortCriteria, filterCriteria);
    
    console.log(`Retrieved ${workPageData.totalActivities} activities for user ${userId}`);
    
    res.status(200).json({
      success: true,
      data: workPageData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in getActivities controller:', error);
    res.status(500).json({ 
      error: 'Failed to fetch activities',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Get single activity for workspace tab
async function getActivityForWorkspace(req, res) {
  try {
    const activityId = parseInt(req.params.activityId);
    const userId = parseInt(req.params.userId);

    if (!activityId || !userId || isNaN(activityId) || isNaN(userId)) {
      return res.status(400).json({ 
        error: 'Valid Activity ID and User ID are required',
        received: { activityId: req.params.activityId, userId: req.params.userId }
      });
    }

    console.log(`Fetching activity ${activityId} for workspace for user ${userId}`);
    
    const activity = await workService.getActivityForWorkspace(activityId, userId);
    
    res.status(200).json({
      success: true,
      data: activity,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in getActivityForWorkspace controller:', error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ 
      error: 'Failed to fetch activity',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Complete an activity and get next
async function completeActivity(req, res) {
  try {
    const activityId = parseInt(req.params.id);
    const userId = parseInt(req.body.userId);
    const notes = req.body.notes || '';

    if (!activityId || !userId || isNaN(activityId) || isNaN(userId)) {
      return res.status(400).json({ 
        error: 'Valid Activity ID and User ID are required',
        received: { activityId: req.params.id, userId: req.body.userId }
      });
    }

    console.log(`Completing activity ${activityId} for user ${userId}`);
    
    const result = await workService.completeActivityAndGetNext(activityId, userId, notes);
    
    console.log(`Activity ${activityId} completed. Next activity available: ${!!result.nextActivity}`);
    
    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in completeActivity controller:', error);
    res.status(500).json({ 
      error: 'Failed to complete activity',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Update activity in workspace
async function updateActivity(req, res) {
  try {
    const activityId = parseInt(req.params.activityId);
    const userId = parseInt(req.params.userId); // Get from params for consistency
    const updateData = req.body; // The entire body is the update data

    if (!activityId || !userId || isNaN(activityId) || isNaN(userId)) {
      return res.status(400).json({ 
        error: 'Valid Activity ID and User ID are required',
        received: { activityId: req.params.activityId, userId: req.params.userId }
      });
    }

    console.log(`Updating activity ${activityId} for user ${userId}`, updateData);
    
    const result = await workService.updateActivityInWorkspace(activityId, userId, updateData);
    
    console.log(`Activity ${activityId} updated successfully`);
    
    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in updateActivity controller:', error);
    res.status(500).json({ 
      error: 'Failed to update activity',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Soft delete activity
async function deleteActivity(req, res) {
  try {
    const activityId = parseInt(req.params.activityId);
    const userId = parseInt(req.params.userId); // Get from params for consistency

    if (!activityId || !userId || isNaN(activityId) || isNaN(userId)) {
      return res.status(400).json({ 
        error: 'Valid Activity ID and User ID are required',
        received: { activityId: req.params.activityId, userId: req.params.userId }
      });
    }

    console.log(`Soft deleting activity ${activityId} for user ${userId}`);
    
    const result = await workService.deleteActivityInWorkspace(activityId, userId);
    
    console.log(`Activity ${activityId} soft deleted successfully`);
    
    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in deleteActivity controller:', error);
    res.status(500).json({ 
      error: 'Failed to delete activity',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Get next activity for workflow
async function getNextActivity(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const currentActivityId = req.query.currentActivityId ? parseInt(req.query.currentActivityId) : null;

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ 
        error: 'Valid User ID is required',
        received: req.params.userId
      });
    }

    console.log(`Fetching next activity for user ${userId}, excluding activity ${currentActivityId}`);
    
    const nextActivity = await workService.getNextActivityForWorkflow(userId, currentActivityId);
    
    res.status(200).json({
      success: true,
      data: nextActivity,
      hasNext: !!nextActivity,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in getNextActivity controller:', error);
    res.status(500).json({ 
      error: 'Failed to fetch next activity',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Get day view activities (calendar style)
async function getDayView(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const date = req.query.date ? new Date(req.query.date) : new Date();

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ 
        error: 'Valid User ID is required',
        received: req.params.userId
      });
    }

    // Validate date if provided
    if (req.query.date && isNaN(date.getTime())) {
      return res.status(400).json({ 
        error: 'Invalid date format',
        received: req.query.date
      });
    }

    console.log(`Fetching day view for user ${userId} on ${date.toDateString()}`);
    
    const dayViewData = await workService.getDayViewActivities(userId, date);
    
    console.log(`Retrieved ${dayViewData.totalCount} activities for day view`);
    
    res.status(200).json({
      success: true,
      data: dayViewData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in getDayView controller:', error);
    res.status(500).json({ 
      error: 'Failed to fetch day view',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Get activities by status filter
async function getActivitiesByStatus(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const status = req.params.status; // 'overdue', 'urgent', 'normal', 'all', 'completed', etc.

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ 
        error: 'Valid User ID is required',
        received: req.params.userId
      });
    }

    const validStatuses = ['overdue', 'urgent', 'normal', 'all', 'completed', 'high-priority', 'today', 'pending'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status filter',
        validOptions: validStatuses,
        received: status
      });
    }

    console.log(`Fetching activities with status '${status}' for user ${userId}`);
    
    const activities = await workService.getActivitiesByStatus(userId, status);
    
    console.log(`Retrieved ${activities.length} activities with status '${status}'`);
    
    res.status(200).json({
      success: true,
      data: {
        activities,
        status,
        count: activities.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in getActivitiesByStatus controller:', error);
    res.status(500).json({ 
      error: 'Failed to fetch activities by status',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Get activity metadata (priority levels, activity types for editing)
async function getActivityMetadata(req, res) {
  try {
    console.log('Fetching activity metadata for editing forms');
    
    const metadata = await workService.getActivityMetadata();
    
    res.status(200).json({
      success: true,
      data: metadata,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in getActivityMetadata controller:', error);
    res.status(500).json({ 
      error: 'Failed to fetch activity metadata',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Get user sequences for workspace context
async function getUserSequences(req, res) {
  try {
    const userId = parseInt(req.params.userId);

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ 
        error: 'Valid User ID is required',
        received: req.params.userId
      });
    }

    console.log(`Fetching sequences for user ${userId} workspace context`);
    
    const sequences = await workService.getUserSequencesForWorkspace(userId);
    
    console.log(`Retrieved ${sequences.length} sequences for user ${userId}`);
    
    res.status(200).json({
      success: true,
      data: sequences,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in getUserSequences controller:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user sequences',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Get work dashboard summary
async function getWorkDashboard(req, res) {
  try {
    const userId = parseInt(req.params.userId);

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ 
        error: 'Valid User ID is required',
        received: req.params.userId
      });
    }

    console.log(`Fetching work dashboard summary for user ${userId}`);
    
    const dashboardData = await workService.getWorkDashboardSummary(userId);
    
    res.status(200).json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in getWorkDashboard controller:', error);
    res.status(500).json({ 
      error: 'Failed to fetch work dashboard',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = {
  getActivities,
  getActivityForWorkspace,
  completeActivity,
  updateActivity,
  deleteActivity,
  getNextActivity,
  getDayView,
  getActivitiesByStatus,
  getActivityMetadata,
  getUserSequences,
  getWorkDashboard
};