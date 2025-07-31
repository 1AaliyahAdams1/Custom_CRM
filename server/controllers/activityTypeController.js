const activityTypeService = require("../services/activityTypeService");

const getAllActivityTypes = async (req, res) => {
  try {
    const data = await activityTypeService.getAllActivityTypes();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getActivityTypeById = async (req, res) => {
  try {
    const data = await activityTypeService.getActivityTypeById(req.params.id);
    if (!data) return res.status(404).json({ error: "Activity type not found" });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createActivityType = async (req, res) => {
  try {
    await activityTypeService.createActivityType(req.body);
    res.status(201).json({ message: "Activity type created successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const updateActivityType = async (req, res) => {
  try {
    await activityTypeService.updateActivityType(req.params.id, req.body);
    res.status(200).json({ message: "Activity type updated successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deactivateActivityType = async (req, res) => {
  try {
    await activityTypeService.deactivateActivityType(req.params.id);
    res.status(200).json({ message: "Activity type deactivated successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const reactivateActivityType = async (req, res) => {
  try {
    await activityTypeService.reactivateActivityType(req.params.id);
    res.status(200).json({ message: "Activity type reactivated successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteActivityType = async (req, res) => {
  try {
    await activityTypeService.deleteActivityType(req.params.id);
    res.status(200).json({ message: "Activity type deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
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
