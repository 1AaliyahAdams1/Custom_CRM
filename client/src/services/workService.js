import api from "../utils/api";

const RESOURCE = "/work";

/**
 * Get work page activities (due today or overdue only)
 * @param {number} userId - User ID
 * @param {string} sortCriteria - Sort criteria (dueDate, priority, account, type)
 * @param {string} filter - Filter type (all, overdue, today, high-priority)
 * @returns {Promise<Object>} Work page activities
 */
export const getWorkPageActivities = async (userId, sortCriteria = "dueDate", filter = "all") => {
  if (!userId) throw new Error("User ID is required");

  try {
    const params = new URLSearchParams();
    if (sortCriteria && sortCriteria !== "dueDate") params.append("sort", sortCriteria);
    if (filter && filter !== "all") params.append("filter", filter);

    const queryString = params.toString();
    const url = `${RESOURCE}/user/${userId}/activities${queryString ? `?${queryString}` : ""}`;

    const response = await api.get(url);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching work page activities:", error);
    throw error;
  }
};

/**
 * Get account activities grouped (previous, current, upcoming)
 * @param {number} userId - User ID
 * @param {number} accountId - Account ID
 * @returns {Promise<Object>} Grouped account activities
 */
export const getAccountActivitiesGrouped = async (userId, accountId) => {
  if (!userId) throw new Error("User ID is required");
  if (!accountId) throw new Error("Account ID is required");

  try {
    const url = `${RESOURCE}/user/${userId}/account/${accountId}/grouped`;
    const response = await api.get(url);
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error("Error fetching account activities grouped:", error);
    throw error;
  }
};

/**
 * Get single activity by ID
 * @param {number} activityId - Activity ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Activity data
 */
export const getActivityByID = async (activityId, userId) => {
  if (!activityId) throw new Error("Activity ID is required");
  if (!userId) throw new Error("User ID is required");

  try {
    const url = `${RESOURCE}/user/${userId}/activity/${activityId}`;
    const response = await api.get(url);
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error("Error fetching activity by ID:", error);
    throw error;
  }
};

/**
 * Update activity
 * @param {number} activityId - Activity ID
 * @param {number} userId - User ID
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object>} Update result
 */
export const updateActivity = async (activityId, userId, updateData) => {
  if (!activityId) throw new Error("Activity ID is required");
  if (!userId) throw new Error("User ID is required");
  if (!updateData || typeof updateData !== "object") {
    throw new Error("Update data is required");
  }

  try {
    const url = `${RESOURCE}/user/${userId}/activity/${activityId}`;
    const response = await api.put(url, updateData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error updating activity:", error);
    throw error;
  }
};

/**
 * Update activity due date with cascade to subsequent activities
 * @param {number} activityId - Activity ID
 * @param {number} userId - User ID
 * @param {string} dueDate - New due date (ISO string)
 * @returns {Promise<Object>} Update result
 */
export const updateActivityDueDateWithCascade = async (activityId, userId, dueDate) => {
  if (!activityId) throw new Error("Activity ID is required");
  if (!userId) throw new Error("User ID is required");
  if (!dueDate) throw new Error("Due date is required");

  try {
    const url = `${RESOURCE}/user/${userId}/activity/${activityId}/due-date`;
    const response = await api.put(url, { dueDate });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error updating activity due date with cascade:", error);
    throw error;
  }
};

/**
 * Complete activity
 * @param {number} activityId - Activity ID to complete
 * @param {number} userId - User ID
 * @param {string} notes - Optional completion notes
 * @returns {Promise<Object>} Completion result
 */
export const completeActivity = async (activityId, userId, notes = "") => {
  if (!activityId) throw new Error("Activity ID is required");
  if (!userId) throw new Error("User ID is required");

  try {
    const url = `${RESOURCE}/activities/${activityId}/complete`;
    const payload = { userId, notes };
    const response = await api.post(url, payload);
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error("Error completing activity:", error);
    throw error;
  }
};

/**
 * Mark activity as complete (simple)
 * @param {number} activityId - Activity ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Completion result
 */
export const markActivityComplete = async (activityId, userId) => {
  if (!activityId) throw new Error("Activity ID is required");
  if (!userId) throw new Error("User ID is required");

  try {
    const url = `${RESOURCE}/user/${userId}/activity/${activityId}/complete`;
    const response = await api.patch(url);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error marking activity complete:", error);
    throw error;
  }
};

/**
 * Delete activity
 * @param {number} activityId - Activity ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteActivity = async (activityId, userId) => {
  if (!activityId) throw new Error("Activity ID is required");
  if (!userId) throw new Error("User ID is required");

  try {
    const url = `${RESOURCE}/user/${userId}/activity/${activityId}`;
    const response = await api.delete(url);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error deleting activity:", error);
    throw error;
  }
};

/**
 * Get next activity
 * @param {number} userId - User ID
 * @param {number} currentActivityId - Current activity to exclude (optional)
 * @returns {Promise<Object>} Next activity data
 */
export const getNextActivity = async (userId, currentActivityId = null) => {
  if (!userId) throw new Error("User ID is required");

  try {
    const params = new URLSearchParams();
    if (currentActivityId) params.append("currentActivityId", currentActivityId.toString());

    const queryString = params.toString();
    const url = `${RESOURCE}/user/${userId}/next-activity${queryString ? `?${queryString}` : ""}`;

    const response = await api.get(url);
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error("Error fetching next activity:", error);
    throw error;
  }
};

/**
 * Get activity metadata
 * @returns {Promise<Object>} Activity metadata
 */
export const getActivityMetadata = async () => {
  try {
    const url = `${RESOURCE}/metadata/activity`;
    const response = await api.get(url);
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error("Error fetching activity metadata:", error);
    throw error;
  }
}