import api from "../utils/api";

const RESOURCE = "/departments";

export const getAllDepartments = async () => {
  try {
    const response = await api.get(RESOURCE);
    return response.data;
  } catch (error) {
    console.error("Error fetching departments:", error?.response || error);
    throw error;
  }
};

export const createDepartment = async (departmentData) => {
  try {
    console.log("Creating department:", departmentData);
    const response = await api.post(RESOURCE, departmentData);
    console.log("Department created:", response?.data);
    return response.data;
  } catch (error) {
    console.error("Error creating department:", error?.response || error);
    throw error;
  }
};


