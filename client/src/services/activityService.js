import api from "../utils/api";

const RESOURCE = "/activities";

export const getAllActivities = async (onlyActive = true) => {
  try {
    const response = await api.get(RESOURCE, { params: { onlyActive } });
    return response.data;
  } catch (error) {
    console.error("Error fetching activities:", error);
    throw error;
  }
};

export const fetchActivityById = async (activityId) => {
  try {
    return await api.get(`${RESOURCE}/${activityId}`);
  } catch (error) {
    console.error(`Error fetching activity ${activityId}:`, error);
    throw error;
  }
};

export const fetchActivitiesByAccountID = async (accountId) => {
  if (!accountId) throw new Error("Account ID is required");
  try {
    const response = await api.get(`${RESOURCE}/account/${accountId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching activities for account ${accountId}:`, error);
    throw error;
  }
};

export const createActivity = async (activityData) => {
  try {
    return await api.post(RESOURCE, activityData);
  } catch (error) {
    console.error("Error creating activity:", error);
    throw error;
  }
};

export const updateActivity = async (activityId, activityData) => {
  try {
    return await api.put(`${RESOURCE}/${activityId}`, activityData);
  } catch (error) {
    console.error(`Error updating activity ${activityId}:`, error);
    throw error;
  }
};

export const deactivateActivity = async (activityId) => {
  try {
    const response = await api.patch(`${RESOURCE}/${activityId}/deactivate`);
    return response.data;
  } catch (error) {
    console.error(`Error deactivating activity ${activityId}:`, error);
    throw error;
  }
};

export const reactivateActivity = async (activityId) => {
  try {
    const response = await api.patch(`${RESOURCE}/${activityId}/reactivate`);
    return response.data;
  } catch (error) {
    console.error(`Error reactivating activity ${activityId}:`, error);
    throw error;
  }
};

export const deleteActivity = async (activityId) => {
  try {
    const response = await api.delete(`${RESOURCE}/${activityId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting activity ${activityId}:`, error);
    throw error;
  }
};

export const fetchActivitiesByUser = async (userId) => {
  if (!userId) throw new Error("User ID is required");
  try {
    const response = await api.get(`${RESOURCE}/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching activities for user ${userId}:`, error);
    throw error;
  }
};

// Bulk mark activities as complete
export const bulkMarkActivitiesComplete = async (activityIds) => {
  if (!Array.isArray(activityIds) || activityIds.length === 0) {
    throw new Error("Activity IDs array is required");
  }
  
  try {
    const response = await api.patch(`${RESOURCE}/bulk/complete`, {
      activityIds: activityIds
    });
    return response.data;
  } catch (error) {
    console.error("Error marking activities as complete:", error);
    throw error;
  }
};

// Bulk mark activities as incomplete
export const bulkMarkActivitiesIncomplete = async (activityIds) => {
  if (!Array.isArray(activityIds) || activityIds.length === 0) {
    throw new Error("Activity IDs array is required");
  }
  
  try {
    const response = await api.patch(`${RESOURCE}/bulk/incomplete`, {
      activityIds: activityIds
    });
    return response.data;
  } catch (error) {
    console.error("Error marking activities as incomplete:", error);
    throw error;
  }
};


// // Bulk delete activities
// export const bulkDeleteActivities = async (activityIds) => {
//   if (!Array.isArray(activityIds) || activityIds.length === 0) {
//     throw new Error("Activity IDs array is required");
//   }
  
//   try {
//     const response = await api.delete(`${RESOURCE}/bulk`, {
//       data: { activityIds: activityIds }
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Error deleting activities:", error);
//     throw error;
//   }
// };

// Bulk update activity status (generic function)
export const bulkUpdateActivityStatus = async (activityIds, status) => {
  if (!Array.isArray(activityIds) || activityIds.length === 0) {
    throw new Error("Activity IDs array is required");
  }
  if (!status) {
    throw new Error("Status is required");
  }
  
  try {
    const response = await api.patch(`${RESOURCE}/bulk/status`, {
      activityIds: activityIds,
      status: status
    });
    return response.data;
  } catch (error) {
    console.error("Error updating activity status:", error);
    throw error;
  }
};

// Bulk update activity priority
export const bulkUpdateActivityPriority = async (activityIds, priorityLevelId) => {
  if (!Array.isArray(activityIds) || activityIds.length === 0) {
    throw new Error("Activity IDs array is required");
  }
  if (!priorityLevelId) {
    throw new Error("Priority Level ID is required");
  }
  
  try {
    const response = await api.patch(`${RESOURCE}/bulk/priority`, {
      activityIds: activityIds,
      priorityLevelId: priorityLevelId
    });
    return response.data;
  } catch (error) {
    console.error("Error updating activity priority:", error);
    throw error;
  }
};

// Bulk update activity due dates
export const bulkUpdateActivityDueDates = async (activityIds, dueToStart, dueToEnd) => {
  if (!Array.isArray(activityIds) || activityIds.length === 0) {
    throw new Error("Activity IDs array is required");
  }
  if (!dueToStart && !dueToEnd) {
    throw new Error("At least one due date (start or end) is required");
  }
  
  try {
    const response = await api.patch(`${RESOURCE}/bulk/due-dates`, {
      activityIds: activityIds,
      dueToStart: dueToStart,
      dueToEnd: dueToEnd
    });
    return response.data;
  } catch (error) {
    console.error("Error updating activity due dates:", error);
    throw error;
  }
};