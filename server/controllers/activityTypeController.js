const activityTypeService = require("../services/activityTypeService");

const getAllActivityTypes = async (req, res) => {
  try {
    const data = await activityTypeService.getAllActivityTypes();
    res.status(200).json(data);
  } catch (err) {
    console.error("Error getting all activity types:", err);
    res.status(500).json({ error: "Failed to get activity types" });
  }
};

const getActivityTypeById = async (req, res) => {
  try {
    const data = await activityTypeService.getActivityTypeById(req.params.id);
    res.status(200).json(data);
  } catch (err) {
    console.error("Error getting activity type by ID:", err);
    res.status(500).json({ error: "Failed to get activity type" });
  }
};

const createActivityType = async (req, res) => {
  try {
    await activityTypeService.createActivityType(req.body);
    res.status(201).json({ message: "Activity type created successfully" });
  } catch (err) {
    console.error("Error creating activity type:", err);
    res.status(500).json({ error: "Failed to create activity type" });
  }
};

const updateActivityType = async (req, res) => {
  try {
    await activityTypeService.updateActivityType(req.params.id, req.body);
    res.status(200).json({ message: "Activity type updated successfully" });
  } catch (err) {
    console.error("Error updating activity type:", err);
    res.status(500).json({ error: "Failed to update activity type" });
  }
};

const deactivateActivityType = async (req, res) => {
  try {
    await activityTypeService.deactivateActivityType(req.params.id);
    res.status(200).json({ message: "Activity type deactivated successfully" });
  } catch (err) {
    console.error("Error deactivating activity type:", err);
    res.status(500).json({ error: "Failed to deactivate activity type" });
  }
};

const reactivateActivityType = async (req, res) => {
  try {
    await activityTypeService.reactivateActivityType(req.params.id);
    res.status(200).json({ message: "Activity type reactivated successfully" });
  } catch (err) {
    console.error("Error reactivating activity type:", err);
    res.status(500).json({ error: "Failed to reactivate activity type" });
  }
};

const deleteActivityType = async (req, res) => {
  try {
    await activityTypeService.deleteActivityType(req.params.id);
    res.status(200).json({ message: "Activity type deleted successfully" });
  } catch (err) {
    console.error("Error deleting activity type:", err);
    res.status(500).json({ error: "Failed to delete activity type" });
  }
};

module.exports = {
  getAllActivityTypes,
  getActivityTypeById,
  createActivityType,
  updateActivityType,
  deactivateActivityType,
  reactivateActivityType,
  deleteActivityType,
};
