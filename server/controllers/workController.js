const workService = require("../services/workService");

//======================================
// Get work page activities (due today or overdue)
//======================================
const getWorkPageActivities = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const sortBy = req.query.sort || 'dueDate';
    const filter = req.query.filter || 'all';

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: "Valid User ID is required" });
    }

    const activities = await workService.getWorkPageActivities(userId, { sortBy, filter });
    
    res.status(200).json({
      success: true,
      activities,
      totalCount: activities.length,
      appliedFilters: { sort: sortBy, filter }
    });
  } catch (err) {
    console.error("Error in getWorkPageActivities:", err);
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Get account activities grouped (for workspace tab)
//======================================
const getAccountActivitiesGrouped = async (req, res) => {
  try {
    const accountId = parseInt(req.params.accountId, 10);
    const userId = parseInt(req.params.userId, 10);

    if (!accountId || !userId || isNaN(accountId) || isNaN(userId)) {
      return res.status(400).json({ error: "Valid Account ID and User ID are required" });
    }

    const data = await workService.getAccountActivitiesGrouped(accountId, userId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Error in getAccountActivitiesGrouped:", err);
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Get activity by ID
//======================================
const getActivityByID = async (req, res) => {
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

    res.status(200).json({ success: true, data: activity });
  } catch (err) {
    console.error("Error in getActivityByID:", err);
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
    res.status(200).json({ success: true, message: "Activity updated successfully" });
  } catch (err) {
    console.error("Error in updateActivity:", err);
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Update activity due date with cascade
//======================================
const updateActivityDueDateWithCascade = async (req, res) => {
  try {
    const activityId = parseInt(req.params.activityId, 10);
    const userId = parseInt(req.params.userId, 10);
    const { dueDate } = req.body;

    if (!activityId || !userId || isNaN(activityId) || isNaN(userId)) {
      return res.status(400).json({ error: "Valid Activity ID and User ID are required" });
    }

    if (!dueDate) {
      return res.status(400).json({ error: "Due date is required" });
    }

    const result = await workService.updateActivityDueDateWithCascade(activityId, userId, dueDate);
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in updateActivityDueDateWithCascade:", err);
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
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error("Error in completeActivity:", err);
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Mark activity as complete (simple)
//======================================
const markComplete = async (req, res) => {
  try {
    const activityId = parseInt(req.params.activityId, 10);
    const userId = parseInt(req.params.userId, 10);

    if (!activityId || !userId || isNaN(activityId) || isNaN(userId)) {
      return res.status(400).json({ error: "Valid Activity ID and User ID are required" });
    }

    await workService.updateActivity(activityId, userId, { Completed: 1 });
    res.status(200).json({ success: true, message: "Activity marked as complete" });
  } catch (err) {
    console.error("Error in markComplete:", err);
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
    res.status(200).json({ success: true, message: "Activity deleted successfully" });
  } catch (err) {
    console.error("Error in deleteActivity:", err);
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
    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Error in getWorkDashboard:", err);
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
    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Error in getNextActivity:", err);
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Get activity metadata
//======================================
const getActivityMetadata = async (req, res) => {
  try {
    const data = await workService.getActivityMetadata();
    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Error in getActivityMetadata:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getWorkPageActivities,
  getAccountActivitiesGrouped,
  getActivityByID,
  updateActivity,
  updateActivityDueDateWithCascade,
  completeActivity,
  markComplete,
  deleteActivity,
  getWorkDashboard,
  getNextActivity,
  getActivityMetadata,
};