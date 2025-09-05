import api from "../utils/api";

const RESOURCE = "/industries";

// --- CRUD Operations ---
export const getAllIndustries = async () => {
  try {
    const response = await api.get(RESOURCE);
    return response.data;
  } catch (error) {
    console.error("Error fetching all industries:", error?.response || error);
    throw error;
  }
};

export const getIndustryById = async (id) => {
  if (!id) throw new Error("Industry ID is required");
  try {
    const response = await api.get(`${RESOURCE}/${encodeURIComponent(id)}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching industry ${id}:`, error?.response || error);
    throw error;
  }
};

export const createIndustry = async (data) => {
  if (!data || !data.IndustryName) throw new Error("Industry name is required");
  try {
    const response = await api.post(RESOURCE, data);
    return response.data;
  } catch (error) {
    console.error("Error creating industry:", error?.response || error);
    throw error;
  }
};

export const updateIndustry = async (id, data) => {
  if (!id) throw new Error("Industry ID is required");
  if (!data || !data.IndustryName) throw new Error("Industry name is required");
  try {
    const response = await api.put(`${RESOURCE}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating industry ${id}:`, error?.response || error);
    throw error;
  }
};

export const deactivateIndustry = async (id) => {
  if (!id) throw new Error("Industry ID is required");
  try {
    const response = await api.patch(`${RESOURCE}/${id}/deactivate`);
    return response.data;
  } catch (error) {
    console.error(`Error deactivating industry ${id}:`, error?.response || error);
    throw error;
  }
};

export const reactivateIndustry = async (id) => {
  if (!id) throw new Error("Industry ID is required");
  try {
    const response = await api.patch(`${RESOURCE}/${id}/reactivate`);
    return response.data;
  } catch (error) {
    console.error(`Error reactivating industry ${id}:`, error?.response || error);
    throw error;
  }
};

export const deleteIndustry = async (id) => {
  if (!id) throw new Error("Industry ID is required");
  try {
    const response = await api.delete(`${RESOURCE}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting industry ${id}:`, error?.response || error);
    throw error;
  }
};

// --- Bulk operations ---
export const bulkDeactivateIndustries = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) throw new Error("Array of industry IDs is required");
  try {
    const promises = ids.map(id => deactivateIndustry(id));
    return await Promise.all(promises);
  } catch (error) {
    console.error("Error bulk deactivating industries:", error?.response || error);
    throw error;
  }
};

export const bulkReactivateIndustries = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) throw new Error("Array of industry IDs is required");
  try {
    const promises = ids.map(id => reactivateIndustry(id));
    return await Promise.all(promises);
  } catch (error) {
    console.error("Error bulk reactivating industries:", error?.response || error);
    throw error;
  }
};

// --- Helper Functions ---
// Get only active industries
export const getActiveIndustries = async () => {
  try {
    const industries = await getAllIndustries();
    return industries.filter(i => i.IsActive === true || i.IsActive === 1);
  } catch (error) {
    console.error("Error fetching active industries:", error?.response || error);
    throw error;
  }
};

// Search industries by name
export const searchIndustries = async (searchTerm) => {
  if (!searchTerm) return getAllIndustries();
  try {
    const industries = await getAllIndustries();
    return industries.filter(i =>
      i.IndustryName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error("Error searching industries:", error?.response || error);
    throw error;
  }
};

// Sort industries by name
export const getIndustriesSorted = async (ascending = true) => {
  try {
    const industries = await getAllIndustries();
    return [...industries].sort((a, b) => {
      const nameA = (a.IndustryName || "").toLowerCase();
      const nameB = (b.IndustryName || "").toLowerCase();
      return ascending ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
  } catch (error) {
    console.error("Error sorting industries:", error?.response || error);
    throw error;
  }
};

// Check if industry name exists (optionally excluding an ID)
export const checkIndustryNameExists = async (name, excludeId = null) => {
  if (!name) return false;
  try {
    const industries = await getAllIndustries();
    const normalized = name.trim().toLowerCase();
    return industries.some(i =>
      i.IndustryName?.toLowerCase() === normalized &&
      (!excludeId || i.IndustryID !== excludeId)
    );
  } catch (error) {
    console.error("Error checking industry name:", error?.response || error);
    throw error;
  }
};

// Get industry stats
export const getIndustryStats = async () => {
  try {
    const industries = await getAllIndustries();
    const total = industries.length;
    const active = industries.filter(i => i.IsActive === true || i.IsActive === 1).length;
    const inactive = total - active;
    return { total, active, inactive, activePercentage: total ? ((active/total)*100).toFixed(1) : "0.0" };
  } catch (error) {
    console.error("Error fetching industry stats:", error?.response || error);
    throw error;
  }
};

// Format name for display
export const formatIndustryName = (name) => {
  if (!name) return "";
  return name
    .trim()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};
