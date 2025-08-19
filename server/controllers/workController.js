const workService = require("../services/workService");

// Get work page activities with sorting and filtering
async function getActivities(req, res) {
  try {
    const userId = req.params.userId;
    const sortCriteria = req.query.sort || 'dueDate';

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const workPageData = await workService.getWorkPageData(userId, sortCriteria);
    res.status(200).json(workPageData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Complete an activity and get next
async function completeActivity(req, res) {
  try {
    const activityId = parseInt(req.params.id);
    const userId = req.body.userId;
    const notes = req.body.notes || '';

    if (!activityId || !userId) {
      return res.status(400).json({ message: 'Activity ID and User ID are required' });
    }

    const result = await workService.completeActivityAndGetNext(activityId, userId, notes);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get day view activities (calendar style)
async function getDayView(req, res) {
  try {
    const userId = req.params.userId;
    const date = req.query.date ? new Date(req.query.date) : new Date();

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const dayViewData = await workService.getDayViewActivities(userId, date);
    res.status(200).json(dayViewData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Update activity order (drag & drop)
async function reorderActivities(req, res) {
  try {
    const userId = req.body.userId;
    const { activityOrder } = req.body;

    if (!userId || !activityOrder || !Array.isArray(activityOrder)) {
      return res.status(400).json({ message: 'User ID and activity order array are required' });
    }

    const result = await workService.updateActivityOrder(userId, activityOrder);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get activities by status filter
async function getActivitiesByStatus(req, res) {
  try {
    const userId = req.params.userId;
    const status = req.params.status; // 'overdue', 'urgent', 'normal', 'all'

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const activities = await workService.getActivitiesByStatus(userId, status);
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getActivities,
  completeActivity,
  getDayView,
  reorderActivities,
  getActivitiesByStatus
};