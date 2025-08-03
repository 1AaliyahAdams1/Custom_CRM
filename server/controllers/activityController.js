const activityService = require("../services/activityService");

const getAllActivities = async (req, res) => {
  try {
    const data = await activityService.getAllActivities();
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

module.exports = {
  getAllActivities,
  getActivityByID,
  createActivity,
  updateActivity,
  deactivateActivity,
  reactivateActivity,
  deleteActivity,
};
