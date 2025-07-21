const activityTypeService = require("../services/activityTypeService");

// Get all activity types
async function getAllActivityTypes(req, res) {
  try {
    // Validation can be done here if needed

    const data = await activityTypeService.getAllActivityTypes();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch activity types" });
  }
}

// Get single activity type by ID
async function getActivityTypeById(req, res) {
  const id = parseInt(req.params.id, 10);
  // Validate id here if needed

  try {
    const data = await activityTypeService.getActivityTypeById(id);
    if (!data) {
      return res.status(404).json({ message: "Activity type not found" });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch activity type" });
  }
}

// Create a new activity type
async function createActivityType(req, res) {
  // Validate request body here if needed

  try {
    const newActivityType = await activityTypeService.createActivityType(req.body);
    res.status(201).json(newActivityType);
  } catch (err) {
    res.status(500).json({ message: "Failed to create activity type" });
  }
}

// Update an activity type by ID
async function updateActivityType(req, res) {
  const id = parseInt(req.params.id, 10);
  // Validate id and request body here if needed

  try {
    const updatedActivityType = await activityTypeService.updateActivityType(id, req.body);
    res.json(updatedActivityType);
  } catch (err) {
    res.status(500).json({ message: "Failed to update activity type" });
  }
}

// Delete an activity type by ID
async function deleteActivityType(req, res) {
  const id = parseInt(req.params.id, 10);
  // Validate id here if needed

  try {
    const result = await activityTypeService.deleteActivityType(id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to delete activity type" });
  }
}

module.exports = {
  getAllActivityTypes,
  getActivityTypeById,
  createActivityType,
  updateActivityType,
  deleteActivityType,
};
