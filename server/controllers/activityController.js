const activityService = require("../services/activityService");

const validateId = (id) => {
  if (!id || isNaN(parseInt(id, 10))) {
    throw new Error("Valid ID is required");
  }
};

const getAllActivities = async (req, res) => {
  try {
    const onlyActive = req.query.onlyActive !== "false";
    const data = await activityService.getAllActivities(onlyActive);
    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Error getting activities:", err);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve activities",
      message: err.message || "Internal Server Error",
    });
  }
};

const getActivityByID = async (req, res) => {
  try {
    const { id } = req.params;
    validateId(id);

    const activity = await activityService.getActivityByID(id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: "Activity not found",
      });
    }

    res.status(200).json({ success: true, data: activity });
  } catch (err) {
    console.error("Error getting activity by ID:", err);
    res.status(err.message === "Valid ID is required" ? 400 : 500).json({
      success: false,
      error:
        err.message === "Valid ID is required"
          ? err.message
          : "Failed to retrieve activity",
      message: err.message || "Internal Server Error",
    });
  }
};

const createActivity = async (req, res) => {
  try {
    const sanitizedData = activityService.sanitizeActivityData(req.body);
    const { activity_name, type, date } = sanitizedData;

    if (!activity_name || !type || !date) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        message: "Activity name, type, and date are required",
      });
    }

    const result = await activityService.createActivity(sanitizedData);

    res.status(201).json({
      success: true,
      message: "Activity created successfully",
      data: result,
    });
  } catch (err) {
    console.error("Error creating activity:", err);
    res.status(err.message.includes("Validation failed") ? 400 : 500).json({
      success: false,
      error: err.message.includes("Validation failed")
        ? "Validation Error"
        : "Failed to create activity",
      message: err.message || "Internal Server Error",
    });
  }
};

const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    validateId(id);

    const sanitizedData = activityService.sanitizeActivityData(req.body);
    const { activity_name, type, date } = sanitizedData;

    if (!activity_name || !type || !date) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        message: "Activity name, type, and date are required",
      });
    }

    const result = await activityService.updateActivity(id, sanitizedData);

    res.status(200).json({
      success: true,
      message: "Activity updated successfully",
      data: result,
    });
  } catch (err) {
    console.error("Error updating activity:", err);
    res
      .status(
        err.message.includes("Validation failed")
          ? 400
          : err.message.includes("not found")
          ? 404
          : 500
      )
      .json({
        success: false,
        error: err.message.includes("Validation failed")
          ? "Validation Error"
          : err.message.includes("not found")
          ? "Activity not found"
          : "Failed to update activity",
        message: err.message || "Internal Server Error",
      });
  }
};

const deactivateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    validateId(id);

    await activityService.deactivateActivity(id);

    res.status(200).json({
      success: true,
      message: "Activity deactivated successfully",
    });
  } catch (err) {
    console.error("Error deactivating activity:", err);
    res.status(err.message.includes("not found") ? 404 : 500).json({
      success: false,
      error: err.message.includes("not found")
        ? "Activity not found"
        : "Failed to deactivate activity",
      message: err.message || "Internal Server Error",
    });
  }
};

const reactivateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    validateId(id);

    await activityService.reactivateActivity(id);

    res.status(200).json({
      success: true,
      message: "Activity reactivated successfully",
    });
  } catch (err) {
    console.error("Error reactivating activity:", err);
    res.status(err.message.includes("not found") ? 404 : 500).json({
      success: false,
      error: err.message.includes("not found")
        ? "Activity not found"
        : "Failed to reactivate activity",
      message: err.message || "Internal Server Error",
    });
  }
};

const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;
    validateId(id);

    await activityService.deleteActivity(id);

    res.status(200).json({
      success: true,
      message: "Activity deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting activity:", err);
    res.status(err.message.includes("not found") ? 404 : 500).json({
      success: false,
      error: err.message.includes("not found")
        ? "Activity not found"
        : "Failed to delete activity",
      message: err.message || "Internal Server Error",
    });
  }
};

const getActivitiesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    validateId(userId);

    const data = await activityService.getActivitiesByUser(
      parseInt(userId, 10)
    );

    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error(
      `Error fetching activities for user ${req.params.userId}:`,
      err
    );
    res.status(err.message === "Valid ID is required" ? 400 : 500).json({
      success: false,
      error:
        err.message === "Valid ID is required"
          ? err.message
          : "Failed to retrieve activities for user",
      message: err.message || "Internal Server Error",
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
};
