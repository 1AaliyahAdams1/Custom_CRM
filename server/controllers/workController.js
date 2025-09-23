const workService = require("../services/workService");

//======================================
// Get activities with filtering (main work page)
//======================================
const getActivities = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const sortBy = req.query.sort || 'dueDate';
    const filter = req.query.filter || 'all';

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: "Valid User ID is required" });
    }

    const data = await workService.getSmartWorkPageData(userId, {
      sort: sortBy,
      filter: filter
    });
    
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Get activities by user 
//======================================
const getActivitiesByUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: "Valid User ID is required" });
    }

    const data = await workService.getActivitiesByUser(userId);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Get activity by ID for workspace
//======================================
const getActivityForWorkspace = async (req, res) => {
  try {
    const activityId = parseInt(req.params.activityId, 10);
    const userId = parseInt(req.params.userId, 10);

    if (!activityId || !userId || isNaN(activityId) || isNaN(userId)) {
      return res.status(400).json({ error: "Valid Activity ID and User ID are required" });
    }

    const activity = await workService.getActivityByID(activityId, userId);
    
    if (!activity) {
      return res.status(404).json({ error: "Activity not found" });
    }

    res.status(200).json(activity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Update activity
//======================================
const updateActivity = async (req, res) => {
  try {
    const activityId = parseInt(req.params.activityId, 10);
    const userId = parseInt(req.params.userId, 10);

    if (!activityId || !userId || isNaN(activityId) || isNaN(userId)) {
      return res.status(400).json({ error: "Valid Activity ID and User ID are required" });
    }

    await workService.updateActivity(activityId, userId, req.body);
    res.status(200).json({ message: "Activity updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Complete activity and get next
//======================================
const completeActivity = async (req, res) => {
  try {
    const activityId = parseInt(req.params.id, 10);
    const userId = parseInt(req.body.userId, 10);

    if (!activityId || !userId || isNaN(activityId) || isNaN(userId)) {
      return res.status(400).json({ error: "Valid Activity ID and User ID are required" });
    }

    const result = await workService.completeActivityAndGetNext(activityId, userId);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Mark activity as complete
//======================================
const markComplete = async (req, res) => {
  try {
    const activityId = parseInt(req.params.activityId, 10);
    const userId = parseInt(req.params.userId, 10);

    if (!activityId || !userId || isNaN(activityId) || isNaN(userId)) {
      return res.status(400).json({ error: "Valid Activity ID and User ID are required" });
    }

    await workService.updateActivity(activityId, userId, { Completed: 1 });
    res.status(200).json({ message: "Activity marked as complete" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Delete activity
//======================================
const deleteActivity = async (req, res) => {
  try {
    const activityId = parseInt(req.params.activityId, 10);
    const userId = parseInt(req.params.userId, 10);

    if (!activityId || !userId || isNaN(activityId) || isNaN(userId)) {
      return res.status(400).json({ error: "Valid Activity ID and User ID are required" });
    }

    await workService.deleteActivity(activityId, userId);
    res.status(200).json({ message: "Activity deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Get work dashboard summary
//======================================
const getWorkDashboard = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: "Valid User ID is required" });
    }

    const data = await workService.getWorkDashboardSummary(userId);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Get sequences and items by user
//======================================
const getSequencesAndItemsByUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: "Valid User ID is required" });
    }

    const data = await workService.getSequencesAndItemsByUser(userId);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Get user sequences
//======================================
const getUserSequences = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: "Valid User ID is required" });
    }

    const data = await workService.getUserSequences(userId);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Get next activity
//======================================
const getNextActivity = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const currentActivityId = req.query.currentActivityId ? parseInt(req.query.currentActivityId, 10) : null;

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: "Valid User ID is required" });
    }

    const data = await workService.getNextActivity(userId, currentActivityId);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Get activities by status filter
//======================================
const getActivitiesByStatus = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const status = req.params.status;

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: "Valid User ID is required" });
    }

    const filterOptions = workService.parseFilterOptions(status);
    const data = await workService.getActivities(userId, filterOptions);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Get day view activities
//======================================
const getDayView = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const date = req.query.date ? new Date(req.query.date) : new Date();

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: "Valid User ID is required" });
    }

    if (req.query.date && isNaN(date.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    // Set date range for the specific day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const data = await workService.getActivities(userId, {
      dateFrom: startOfDay,
      dateTo: endOfDay,
      sortBy: 'dueDate'
    });
    
    res.status(200).json({
      date: date.toDateString(),
      activities: data,
      totalCount: data.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Get activity metadata
//======================================
const getActivityMetadata = async (req, res) => {
  try {
    const data = await workService.getActivityMetadata();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getActivities,
  getActivitiesByUser,
  getActivityForWorkspace,
  updateActivity,
  completeActivity,
  markComplete,
  deleteActivity,
  getWorkDashboard,
  getSequencesAndItemsByUser,
  getUserSequences,
  getNextActivity,
  getActivitiesByStatus,
  getDayView,
  getActivityMetadata,
};