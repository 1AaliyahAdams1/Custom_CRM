const workService = require("../services/workService");

//======================================
// Get Smart Work Page Activities (Main Entry Point)
//======================================
async function getActivities(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const sortBy = req.query.sort || 'dueDate';
    const filter = req.query.filter || 'all';

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ 
        error: 'Valid User ID is required',
        received: req.params.userId
      });
    }

    // Validate sort options
    const validSorts = ['dueDate', 'priority', 'account', 'type', 'sequence', 'status'];
    if (!validSorts.includes(sortBy)) {
      return res.status(400).json({ 
        error: 'Invalid sort option',
        validOptions: validSorts,
        received: sortBy
      });
    }

    // Validate filter options
    const validFilters = ['all', 'overdue', 'urgent', 'high-priority', 'completed', 'pending', 'today'];
    if (!validFilters.includes(filter)) {
      return res.status(400).json({ 
        error: 'Invalid filter option',
        validOptions: validFilters,
        received: filter
      });
    }

    console.log(`Fetching smart work page data for user ${userId} with sort: ${sortBy}, filter: ${filter}`);
    
    const workPageData = await workService.getSmartWorkPageData(userId, {
      sort: sortBy,
      filter: filter
    });
    
    console.log(`Retrieved ${workPageData.totalActivities} activities for smart work page`);
    
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

//======================================
// Get Activities by User (Legacy/Alternative endpoint)
//======================================
async function getActivitiesByUser(req, res) {
  try {
    const userId = parseInt(req.params.userId);

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ 
        error: 'Valid User ID is required',
        received: req.params.userId
      });
    }

    console.log(`Fetching activities by user ${userId}`);
    
    const activities = await workService.getActivitiesByUser(userId);
    
    console.log(`Retrieved ${activities.length} activities for user ${userId}`);
    
    res.status(200).json({
      success: true,
      data: activities,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in getActivitiesByUser controller:', error);
    res.status(500).json({ 
      error: 'Failed to fetch activities by user',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

//======================================
// Get Sequences and Items by User
//======================================
async function getSequencesAndItemsByUser(req, res) {
  try {
    const userId = parseInt(req.params.userId);

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ 
        error: 'Valid User ID is required',
        received: req.params.userId
      });
    }

    console.log(`Fetching sequences and items for user ${userId}`);
    
    const sequences = await workService.getSequencesandItemsByUser(userId);
    
    console.log(`Retrieved ${sequences.length} sequences for user ${userId}`);
    
    res.status(200).json({
      success: true,
      data: sequences,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in getSequencesAndItemsByUser controller:', error);
    res.status(500).json({ 
      error: 'Failed to fetch sequences and items',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

//======================================
// Get User Sequences for Context
//======================================
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
    
    const sequences = await workService.getUserSequencesForContext(userId);
    
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

//======================================
// Get Activity for Workspace Tab
//======================================
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

    console.log(`Fetching activity ${activityId} for workspace tab (user ${userId})`);
    
    const activity = await workService.getActivityForWorkspace(activityId, userId);
    
    res.status(200).json({
      success: true,
      data: activity,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in getActivityForWorkspace controller:', error);
    const statusCode = error.message.includes('not found') || error.message.includes('access denied') ? 404 : 500;
    res.status(statusCode).json({ 
      error: 'Failed to fetch activity for workspace',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

//======================================
// Complete Activity (Smart Workflow)
//======================================
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

    console.log(`Completing activity ${activityId} in smart workflow (user ${userId})`);
    
    const result = await workService.completeActivityWorkflow(activityId, userId, notes);
    
    console.log(`Activity ${activityId} completed. Workflow continues: ${result.workflowContinues}`);
    
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

//======================================
// Mark Activity Complete (Simple)
//======================================
async function markComplete(req, res) {
  try {
    const activityId = parseInt(req.params.activityId);
    const userId = parseInt(req.params.userId);

    if (!activityId || !userId || isNaN(activityId) || isNaN(userId)) {
      return res.status(400).json({ 
        error: 'Valid Activity ID and User ID are required',
        received: { activityId: req.params.activityId, userId: req.params.userId }
      });
    }

    console.log(`Marking activity ${activityId} as complete (user ${userId})`);
    
    const result = await workService.markActivityComplete(activityId, userId);
    
    console.log(`Activity ${activityId} marked as complete successfully`);
    
    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in markComplete controller:', error);
    res.status(500).json({ 
      error: 'Failed to mark activity as complete',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

//======================================
// Update Activity in Workspace
//======================================
async function updateActivity(req, res) {
  try {
    const activityId = parseInt(req.params.activityId);
    const userId = parseInt(req.params.userId);
    const updateData = req.body;

    if (!activityId || !userId || isNaN(activityId) || isNaN(userId)) {
      return res.status(400).json({ 
        error: 'Valid Activity ID and User ID are required',
        received: { activityId: req.params.activityId, userId: req.params.userId }
      });
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({ 
        error: 'Update data is required',
        received: updateData
      });
    }

    console.log(`Updating activity ${activityId} in workspace (user ${userId})`, updateData);
    
    const result = await workService.updateActivityWorkspace(activityId, userId, updateData);
    
    console.log(`Activity ${activityId} updated successfully`);
    
    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in updateActivity controller:', error);
    const statusCode = error.message.includes('not found') ? 404 : 
                      error.message.includes('Invalid') ? 400 : 500;
    res.status(statusCode).json({ 
      error: 'Failed to update activity',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

//======================================
// Delete Activity in Workspace
//======================================
async function deleteActivity(req, res) {
  try {
    const activityId = parseInt(req.params.activityId);
    const userId = parseInt(req.params.userId);

    if (!activityId || !userId || isNaN(activityId) || isNaN(userId)) {
      return res.status(400).json({ 
        error: 'Valid Activity ID and User ID are required',
        received: { activityId: req.params.activityId, userId: req.params.userId }
      });
    }

    console.log(`Soft deleting activity ${activityId} from workspace (user ${userId})`);
    
    const result = await workService.deleteActivityWorkspace(activityId, userId);
    
    console.log(`Activity ${activityId} soft deleted successfully`);
    
    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in deleteActivity controller:', error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ 
      error: 'Failed to delete activity',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

//======================================
// Get Work Dashboard Summary
//======================================
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
    
    const dashboardData = await workService.getWorkDashboard(userId);
    
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

//======================================
// Get Next Activity for Workflow
//======================================
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

    if (req.query.currentActivityId && isNaN(currentActivityId)) {
      return res.status(400).json({ 
        error: 'Invalid current activity ID',
        received: req.query.currentActivityId
      });
    }

    console.log(`Fetching next activity for workflow (user ${userId}, excluding ${currentActivityId})`);
    
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

//======================================
// Get Activities by Status Filter
//======================================
async function getActivitiesByStatus(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const status = req.params.status;

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
    
    const result = await workService.getActivitiesByStatusFilter(userId, status);
    
    console.log(`Retrieved ${result.count} activities with status '${status}'`);
    
    res.status(200).json({
      success: true,
      data: result,
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

//======================================
// Get Day View Activities (Calendar)
//======================================
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

    if (req.query.date && isNaN(date.getTime())) {
      return res.status(400).json({ 
        error: 'Invalid date format. Use YYYY-MM-DD or ISO format',
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

//======================================
// Get Activity Metadata
//======================================
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

module.exports = {
  // Main Smart Work functionality
  getActivities,
  getActivityForWorkspace,
  completeActivity,
  markComplete,
  updateActivity,
  deleteActivity,
  getWorkDashboard,
  getNextActivity,
  getDayView,
  
  // Sequence-related functionality
  getActivitiesByUser,
  getSequencesAndItemsByUser,
  getUserSequences,
  
  // Filtering and metadata
  getActivitiesByStatus,
  getActivityMetadata
};