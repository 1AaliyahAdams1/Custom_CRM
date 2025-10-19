import api from "../utils/api";

const RESOURCE = "/jobTitles";

// --- CRUD Operations ---
export const getAllJobTitles = async () => {
  try {
    const response = await api.get(RESOURCE);
    return response.data;
  } catch (error) {
    console.error("Error fetching all job titles:", error?.response || error);
    throw error;
  }
};
export const getJobTitleById = async (id) => {
  if (!id) throw new Error("Job Title ID is required");
    try {
    const response = await api.get(`${RESOURCE}/${encodeURIComponent(id)}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching job title ${id}:`, error?.response || error);
    throw error;
  }
};
export const createJobTitle = async (data) => {
  if (!data || !data.JobTitleName) throw new Error("Job Title name is required");
  try {
    const response = await api.post(RESOURCE, data);
    return response.data;
  } catch (error) {
    console.error("Error creating job title:", error?.response || error);
    throw error;
  }
};
export const updateJobTitle = async (id, data) => {
  if (!id) throw new Error("Job Title ID is required");
  if (!data || !data.JobTitleName) throw new Error("Job Title name is required");
    try {
    const response = await api.put(`${RESOURCE}/${id}`, data);
    return response.data;
  }
    catch (error) {
    console.error(`Error updating job title ${id}:`, error?.response || error);
    throw error;
  }
};
export const deactivateJobTitle = async (id) => {
  if (!id) throw new Error("Job Title ID is required");
  try {
    const response = await api.patch(`${RESOURCE}/${id}/deactivate`);
    return response.data;
  } catch (error) {
    console.error(`Error deactivating job title ${id}:`, error?.response || error);
    throw error;
  }
};

export const reactivateJobTitle = async (id) => {
  if (!id) throw new Error("Job Title ID is required");
    try {
    const response = await api.patch(`${RESOURCE}/${id}/reactivate`);
    return response.data;
  } catch (error) {
    console.error(`Error reactivating job title ${id}:`, error?.response || error);
    throw error;
  }
};

export const getActiveJobTitles = async () => {
  try {
    const response = await api.get(`${RESOURCE}/active`);
    return response.data;
  } catch (error) {
    console.error("Error fetching active job titles:", error?.response || error);
    throw error;
  }
};
export const searchJobTitles = async (searchTerm) => {
  if (!searchTerm) throw new Error("Search term is required");
    try {
    const response = await api.get(`${RESOURCE}/search`, { params: { q: searchTerm } });
    return response.data;
    } catch (error) {
    console.error(`Error searching job titles with term "${searchTerm}":`, error?.response || error);
    throw error;
  }
};
