// controllers/activityController.js

const activityService = require("../services/activityService");

const getAllActivities = async (req, res) => {
  try {
    const onlyActive = req.query.onlyActive !== 'false'; 
    const data = await activityService.getAllActivities(onlyActive);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const getActivityByID = async (req, res) => {
  try {
    const activity = await activityService.getActivityByID(req.params.id);
    res.status(200).json(activity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createActivity = async (req, res) => {
  try {
    await activityService.createActivity(req.body);
    res.status(201).json({ message: "Activity created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateActivity = async (req, res) => {
  try {
    await activityService.updateActivity(req.params.id, req.body);
    res.status(200).json({ message: "Activity updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deactivateActivity = async (req, res) => {
  try {
    await activityService.deactivateActivity(req.params.id);
    res.status(200).json({ message: "Activity deactivated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const reactivateActivity = async (req, res) => {
  try {
    await activityService.reactivateActivity(req.params.id);
    res.status(200).json({ message: "Activity reactivated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteActivity = async (req, res) => {
  try {
    await activityService.deleteActivity(req.params.id);
    res.status(200).json({ message: "Activity deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const getActivitiesByUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: "Valid User ID is required" });
    }

    const data = await activityService.getActivitiesByUser(userId);
    res.status(200).json(data);
  } catch (err) {
    console.error(`Error fetching activities for user ${req.params.userId}:`, err);
    res.status(500).json({ error: err.message });
  }
};

//Bulk Operations Controllers
const bulkMarkActivitiesComplete = async (req, res) => {
  try {
    const { activityIds } = req.body;
    const result = await activityService.bulkMarkActivitiesComplete(activityIds);
    res.json(result);
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const bulkMarkActivitiesIncomplete = async (req, res) => {
  try {
    const { activityIds } = req.body;
    const result = await activityService.bulkMarkActivitiesIncomplete(activityIds);
    res.json(result);
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const bulkUpdateActivityStatus = async (req, res) => {
  try {
    const { activityIds, status } = req.body;
    const result = await activityService.bulkUpdateActivityStatus(activityIds, status);
    res.json(result);
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const bulkUpdateActivityPriority = async (req, res) => {
  try {
    const { activityIds, priorityLevelId } = req.body;
    const result = await activityService.bulkUpdateActivityPriority(activityIds, priorityLevelId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const bulkUpdateActivityDueDates = async (req, res) => {
  try {
    const { activityIds, dueToStart, dueToEnd } = req.body;
    const result = await activityService.bulkUpdateActivityDueDates(activityIds, dueToStart, dueToEnd);
    res.json(result);
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = {
  getAllActivities,
  getActivityByID,
  createActivity,
  updateActivity,
  deactivateActivity,
  reactivateActivity,
  deleteActivity,
  getActivitiesByUser,
  // Bulk operations
  bulkMarkActivitiesComplete,
  bulkMarkActivitiesIncomplete,
  bulkUpdateActivityStatus,
  bulkUpdateActivityPriority,
  bulkUpdateActivityDueDates,
};
