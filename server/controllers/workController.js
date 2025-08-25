const workService = require("../services/workService");

// Get work page activities with sorting and filtering
async function getActivities(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const sortCriteria = req.query.sort || 'dueDate';

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ 
        error: 'Valid User ID is required',
        received: req.params.userId
      });
    }

    console.log(`Fetching work page data for user ${userId} with sort: ${sortCriteria}`);
    
    const workPageData = await workService.getWorkPageData(userId, sortCriteria);
    
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

// Update activity order (drag & drop)
async function reorderActivities(req, res) {
  try {
    const userId = parseInt(req.body.userId);
    const { activityOrder } = req.body;

    if (!userId || !activityOrder || !Array.isArray(activityOrder) || isNaN(userId)) {
      return res.status(400).json({ 
        error: 'Valid User ID and activity order array are required',
        received: { userId: req.body.userId, activityOrderType: typeof activityOrder }
      });
    }

    // Validate activityOrder array structure
    const isValidOrder = activityOrder.every(item => 
      item.activityId && item.order !== undefined && 
      !isNaN(parseInt(item.activityId)) && !isNaN(parseInt(item.order))
    );

    if (!isValidOrder) {
      return res.status(400).json({ 
        error: 'Invalid activity order format. Expected array of {activityId, order}',
        received: activityOrder
      });
    }

    console.log(`Reordering ${activityOrder.length} activities for user ${userId}`);
    
    const result = await workService.updateActivityOrder(userId, activityOrder);
    
    console.log(`Activity reorder completed successfully`);
    
    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in reorderActivities controller:', error);
    res.status(500).json({ 
      error: 'Failed to reorder activities',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Get activities by status filter
async function getActivitiesByStatus(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const status = req.params.status; // 'overdue', 'urgent', 'normal', 'all'

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ 
        error: 'Valid User ID is required',
        received: req.params.userId
      });
    }

    const validStatuses = ['overdue', 'urgent', 'normal', 'all'];
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

module.exports = {
  getActivities,
  completeActivity,
  getDayView,
  reorderActivities,
  getActivitiesByStatus
};