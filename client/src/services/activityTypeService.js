import api from "../utils/api";

const BASE_URL = "/activitytypes";

// -----------------------
// CRUD METHODS
// -----------------------

export const getAllActivityTypes = async () => {
  try {
    const { data } = await api.get(BASE_URL);
    return { success: true, data, message: "Activity types retrieved successfully" };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || error.message || "Failed to retrieve activity types",
    };
  }
};

export const getActivityTypeById = async (id) => {
  if (!id) return { success: false, data: null, message: "Type ID is required" };
  try {
    const { data } = await api.get(`${BASE_URL}/${id}`);
    return { success: true, data, message: "Activity type retrieved successfully" };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || error.message || "Failed to retrieve activity type",
    };
  }
};

export const createActivityType = async (activityTypeData) => {
  if (!activityTypeData?.TypeName) return { success: false, data: null, message: "Type name is required" };
  try {
    const { data } = await api.post(BASE_URL, activityTypeData);
    return { success: true, data, message: "Activity type created successfully" };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || error.message || "Failed to create activity type",
    };
  }
};

export const updateActivityType = async (id, activityTypeData) => {
  if (!id) return { success: false, data: null, message: "Type ID is required" };
  try {
    const { data } = await api.put(`${BASE_URL}/${id}`, activityTypeData);
    return { success: true, data, message: "Activity type updated successfully" };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || error.message || "Failed to update activity type",
    };
  }
};

export const deactivateActivityType = async (id) => {
  if (!id) return { success: false, data: null, message: "Type ID is required" };
  try {
    const { data } = await api.patch(`${BASE_URL}/${id}/deactivate`);
    return { success: true, data, message: "Activity type deactivated successfully" };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || error.message || "Failed to deactivate activity type",
    };
  }
};

export const reactivateActivityType = async (id) => {
  if (!id) return { success: false, data: null, message: "Type ID is required" };
  try {
    const { data } = await api.patch(`${BASE_URL}/${id}/reactivate`);
    return { success: true, data, message: "Activity type reactivated successfully" };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || error.message || "Failed to reactivate activity type",
    };
  }
};

export const deleteActivityType = async (id) => {
  if (!id) return { success: false, data: null, message: "Type ID is required" };
  try {
    await api.delete(`${BASE_URL}/${id}`);
    return { success: true, data: null, message: "Activity type deleted successfully" };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || error.message || "Failed to delete activity type",
    };
  }
};

// -----------------------
// BULK OPERATIONS
// -----------------------

export const bulkDeactivateActivityTypes = async (ids = []) => {
  if (!Array.isArray(ids) || !ids.length) return { success: false, data: null, message: "IDs are required" };
  const results = await Promise.allSettled(ids.map(id => deactivateActivityType(id)));
  const successful = results.filter(r => r.status === "fulfilled" && r.value.success);
  const failed = results.filter(r => r.status === "rejected" || !r.value.success);
  return {
    success: failed.length === 0,
    data: { successful: successful.length, failed: failed.length, total: ids.length },
    message: `Deactivated ${successful.length} out of ${ids.length} activity types`,
  };
};

export const bulkReactivateActivityTypes = async (ids = []) => {
  if (!Array.isArray(ids) || !ids.length) return { success: false, data: null, message: "IDs are required" };
  const results = await Promise.allSettled(ids.map(id => reactivateActivityType(id)));
  const successful = results.filter(r => r.status === "fulfilled" && r.value.success);
  const failed = results.filter(r => r.status === "rejected" || !r.value.success);
  return {
    success: failed.length === 0,
    data: { successful: successful.length, failed: failed.length, total: ids.length },
    message: `Reactivated ${successful.length} out of ${ids.length} activity types`,
  };
};

export const bulkDeleteActivityTypes = async (ids = []) => {
  if (!Array.isArray(ids) || !ids.length) return { success: false, data: null, message: "IDs are required" };
  const results = await Promise.allSettled(ids.map(id => deleteActivityType(id)));
  const successful = results.filter(r => r.status === "fulfilled" && r.value.success);
  const failed = results.filter(r => r.status === "rejected" || !r.value.success);
  return {
    success: failed.length === 0,
    data: { successful: successful.length, failed: failed.length, total: ids.length },
    message: `Deleted ${successful.length} out of ${ids.length} activity types`,
  };
};

// -----------------------
// SEARCH & FILTER
// -----------------------

export const getActiveActivityTypes = async () => {
  const response = await getAllActivityTypes();
  if (!response.success) return response;
  const active = response.data.filter(at => at.IsActive === true || at.IsActive === 1);
  return { success: true, data: active, message: `Found ${active.length} active activity types` };
};

export const searchActivityTypes = async (term = "") => {
  const response = await getAllActivityTypes();
  if (!response.success) return response;
  if (!term.trim()) return response;
  const filtered = response.data.filter(
    at => (at.TypeName?.toLowerCase().includes(term.toLowerCase())) ||
          (at.Description?.toLowerCase().includes(term.toLowerCase()))
  );
  return { success: true, data: filtered, message: `Found ${filtered.length} activity types matching "${term}"` };
};

// -----------------------
// DROPDOWN / SELECT HELPERS
// -----------------------

export const getActivityTypesForDropdown = async (includeInactive = false, groupByCategory = false) => {
  const response = includeInactive ? await getAllActivityTypes() : await getActiveActivityTypes();
  if (!response.success) return response;

  const sorted = [...response.data].sort((a, b) => (a.TypeName || "").toLowerCase().localeCompare((b.TypeName || "").toLowerCase()));

  if (!groupByCategory) {
    const options = sorted.map(at => ({
      value: at.TypeID,
      label: at.TypeName,
      description: at.Description,
      category: at.Category,
      isActive: at.IsActive === true || at.IsActive === 1,
      raw: at,
    }));
    return { success: true, data: options, message: "Dropdown options retrieved successfully" };
  }

  const grouped = sorted.reduce((groups, at) => {
    const category = at.Category || "Uncategorized";
    if (!groups[category]) groups[category] = [];
    groups[category].push({
      value: at.TypeID,
      label: at.TypeName,
      description: at.Description,
      isActive: at.IsActive === true || at.IsActive === 1,
      raw: at,
    });
    return groups;
  }, {});

  return { success: true, data: grouped, message: "Dropdown options grouped by category retrieved successfully" };
};
