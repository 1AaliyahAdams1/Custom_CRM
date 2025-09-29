import api from "../utils/api";

const RESOURCE = "/work";

// =======================
// SMART WORK PAGE SERVICES
// =======================

/**
 * Get smart work page data with sorting and filtering
 * @param {number} userId - User ID
 * @param {string} sortCriteria - Sort criteria (dueDate, priority, account, type, sequence, status)
 * @param {string} filter - Filter type (all, overdue, urgent, high-priority, today, pending, completed)
 * @returns {Promise<Object>} Work page data with activities
 */
export const getWorkPageData = async (userId, sortCriteria = "dueDate", filter = "all") => {
  if (!userId) throw new Error("User ID is required");

  try {
    const params = new URLSearchParams();
    if (sortCriteria && sortCriteria !== "dueDate") params.append("sort", sortCriteria);
    if (filter && filter !== "all") params.append("filter", filter);

    const queryString = params.toString();
    const url = `${RESOURCE}/user/${userId}/activities${queryString ? `?${queryString}` : ""}`;

    const response = await api.get(url);

    if (response.data) {
      return response.data;
    }

    // fallback
    return {
      activities: [],
      totalActivities: 0,
      appliedFilters: { filter: "all", sort: "dueDate" },
    };
  } catch (error) {
    console.error("Error fetching work page data:", error);
    throw error;
  }
};

/**
 * Get single activity for workspace tab with full context
 * @param {number} activityId - Activity ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Detailed activity data
 */
export const getActivityForWorkspace = async (activityId, userId) => {
  if (!activityId) throw new Error("Activity ID is required");
  if (!userId) throw new Error("User ID is required");

  try {
    const url = `${RESOURCE}/user/${userId}/activity/${activityId}/workspace`;
    const response = await api.get(url);

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching activity for workspace:", error);
    throw error;
  }
};

/**
 * Complete activity using smart workflow (gets next activity automatically)
 * @param {number} activityId - Activity ID to complete
 * @param {number} userId - User ID
 * @param {string} notes - Optional completion notes
 * @returns {Promise<Object>} Completion result with next activity
 */
export const completeActivity = async (activityId, userId, notes = "") => {
  if (!activityId) throw new Error("Activity ID is required");
  if (!userId) throw new Error("User ID is required");

  try {
    const url = `${RESOURCE}/activities/${activityId}/complete`;
    const payload = { userId, notes };
    const response = await api.post(url, payload);

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error completing activity workflow:", error);
    throw error;
  }
};

/**
 * Mark activity as complete (simple completion without workflow)
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
 * Update activity in workspace
 * @param {number} activityId - Activity ID
 * @param {number} userId - User ID
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object>} Updated activity data
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
 * Soft delete activity (sets Active = 0, suggests next activity)
 * @param {number} activityId - Activity ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Deletion result with suggested next activity
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
 * Get activities by status filter
 * @param {number} userId - User ID
 * @param {string} status - Status filter (overdue, urgent, normal, completed, etc.)
 * @returns {Promise<Object>} Filtered activities
 */
export const getActivitiesByStatus = async (userId, status) => {
  if (!userId) throw new Error("User ID is required");
  if (!status) throw new Error("Status is required");

  try {
    const url = `${RESOURCE}/user/${userId}/activities/${status}`;
    const response = await api.get(url);

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching activities by status:", error);
    throw error;
  }
};

/**
 * Get next activity in smart workflow
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

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching next activity:", error);
    throw error;
  }
};

/**
 * Get activity metadata (priority levels, activity types for editing forms)
 * @returns {Promise<Object>} Activity metadata
 */
export const getActivityMetadata = async () => {
  try {
    const url = `${RESOURCE}/metadata/activity`;
    const response = await api.get(url);

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching activity metadata:", error);
    throw error;
  }
};

/**
 * Get user sequences for workspace context
 * @param {number} userId - User ID
 * @returns {Promise<Object>} User sequences data
 */
export const getUserSequences = async (userId) => {
  if (!userId) throw new Error("User ID is required");

  try {
    const url = `${RESOURCE}/user/${userId}/sequences`;
    const response = await api.get(url);

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching user sequences:", error);
    throw error;
  }
};
