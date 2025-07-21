const activityService = require("../services/activityService");

// Get all activities
async function getActivities(req, res) {
  try {
    // Validation can go here

    const activities = await activityService.getAllActivities();
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Create a new activity
async function createActivity(req, res) {
  try {
    // Validation can go here

    const newActivity = await activityService.createActivity(req.body);
    res.status(201).json(newActivity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update an activity by ID
async function updateActivity(req, res) {
  const id = parseInt(req.params.id, 10);

  try {
    // Validation can go here

    const updatedActivity = await activityService.updateActivity(id, req.body);
    res.json(updatedActivity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Delete an activity by ID
async function deleteActivity(req, res) {
  const id = parseInt(req.params.id, 10);

  try {
    // Validation can go here

    const deleted = await activityService.deleteActivity(id);
    res.json(deleted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get Activity Details for Details Page
async function getActivityDetails(req, res) {
  const id = parseInt(req.params.id, 10);

  try {
    // Validation can go here

    const details = await activityService.getActivityDetails(id);
    res.json(details);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  getActivityDetails,
};
