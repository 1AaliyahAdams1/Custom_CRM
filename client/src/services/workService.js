import api from "../utils/api";

const RESOURCE = "/work";

// Get work page activities with sorting and filtering
export const getWorkPageData = async (userId, sortCriteria = 'dueDate') => {
  if (!userId) throw new Error("User ID is required");
  
  try {
    const response = await api.get(`${RESOURCE}/user/${userId}/activities?sort=${sortCriteria}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching work page data:", error);
    throw error;
  }
};

// Complete an activity and get next
export const completeActivity = async (activityId, userId, notes = '') => {
  if (!activityId) throw new Error("Activity ID is required");
  if (!userId) throw new Error("User ID is required");

  try {
    const response = await api.post(`${RESOURCE}/activities/${activityId}/complete`, {
      userId: userId,
      notes: notes
    });
    return response.data;
  } catch (error) {
    console.error("Error completing activity:", error);
    throw error;
  }
};

// Get activities by status filter
export const getActivitiesByStatus = async (userId, status) => {
  if (!userId) throw new Error("User ID is required");
  if (!status) throw new Error("Status is required");

  try {
    const response = await api.get(`${RESOURCE}/user/${userId}/activities/${status}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching activities by status:", error);
    throw error;
  }
};

// Get day view activities (calendar style)
export const getDayViewActivities = async (userId, date = new Date()) => {
  if (!userId) throw new Error("User ID is required");

  try {
    const dateStr = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    const response = await api.get(`${RESOURCE}/user/${userId}/day-view?date=${dateStr}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching day view activities:", error);
    throw error;
  }
};

// Update activity order (drag & drop)
export const updateActivityOrder = async (userId, activityOrder) => {
  if (!userId) throw new Error("User ID is required");
  if (!activityOrder || !Array.isArray(activityOrder)) {
    throw new Error("Activity order array is required");
  }

  try {
    const response = await api.put(`${RESOURCE}/activities/reorder`, {
      userId: userId,
      activityOrder: activityOrder
    });
    return response.data;
  } catch (error) {
    console.error("Error updating activity order:", error);
    throw error;
  }
};

// Transform database activity to UI format
export const transformActivityForUI = (dbActivity) => {
  if (!dbActivity) return null;

  return {
    id: dbActivity.ActivityID?.toString(),
    title: generateActivityTitle(dbActivity),
    description: dbActivity.SequenceItemDescription || 'No description available',
    type: mapActivityType(dbActivity.ActivityTypeName),
    priority: mapPriority(dbActivity.PriorityLevelName),
    status: mapStatus(dbActivity),
    dueDate: new Date(dbActivity.DueToStart),
    estimatedDuration: 30, // Default, you might want to add this to your DB
    createdAt: new Date(dbActivity.ActivityCreated),
    updatedAt: new Date(dbActivity.ActivityUpdated),
    accountName: dbActivity.AccountName,
    sequenceName: dbActivity.SequenceName,
    notes: dbActivity.Notes || '',
  };
};

// Generate activity title based on type and description
const generateActivityTitle = (dbActivity) => {
  const activityType = dbActivity.ActivityTypeName;
  const account = dbActivity.AccountName;
  
  if (dbActivity.SequenceItemDescription) {
    return `${activityType}: ${dbActivity.SequenceItemDescription}`;
  }
  
  return `${activityType} - ${account}`;
};

// Map database activity type to UI type
const mapActivityType = (activityTypeName) => {
  if (!activityTypeName) return 'task';
  
  const type = activityTypeName.toLowerCase();
  if (type.includes('call')) return 'call';
  if (type.includes('email')) return 'email';
  if (type.includes('meeting')) return 'meeting';
  return 'task';
};

// Map database priority to UI priority
const mapPriority = (priorityLevelName) => {
  if (!priorityLevelName) return 'medium';
  
  const priority = priorityLevelName.toLowerCase();
  if (priority.includes('high') || priority.includes('urgent')) return 'high';
  if (priority.includes('low')) return 'low';
  return 'medium';
};

// Map database status to UI status
const mapStatus = (dbActivity) => {
  if (dbActivity.Completed) return 'completed';
  
  const dueDate = new Date(dbActivity.DueToStart);
  const now = new Date();
  
  if (dueDate < now) return 'overdue';
  return 'pending';
};

// Transform work page data for UI
export const transformWorkPageData = (workPageData) => {
  if (!workPageData || !workPageData.activities) {
    return {
      activities: [],
      groupedActivities: { overdue: [], urgent: [], normal: [] },
      sequences: [],
      totalActivities: 0,
      overdueCount: 0,
      urgentCount: 0
    };
  }

  const transformedActivities = workPageData.activities.map(activity => 
    transformActivityForUI(activity)
  ).filter(Boolean); // Remove any null results

  return {
    ...workPageData,
    activities: transformedActivities,
    groupedActivities: {
      overdue: transformedActivities.filter(a => a.status === 'overdue'),
      urgent: transformedActivities.filter(a => a.status === 'urgent'),
      normal: transformedActivities.filter(a => a.status === 'pending')
    }
  };
};