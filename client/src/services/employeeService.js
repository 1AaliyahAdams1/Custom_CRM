import api from "../utils/api";

const EMPLOYEE_API = "/employees"; 

export const getAllEmployees = async () => {
  try {
    const res = await api.get(EMPLOYEE_API);
    return res.data;
  } catch (error) {
    console.error("Error fetching all employees:", error.response?.data || error.message);
    throw error;
  }
};

export const getEmployeeById = async (id) => {
  try {
    const res = await api.get(`${EMPLOYEE_API}/${id}`);
    return res.data;
  } catch (error) {
    console.error(`Error fetching employee ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

export const createEmployee = async (data, changedBy, actionTypeId) => {
  try {
    await api.post(EMPLOYEE_API, { data, changedBy, actionTypeId });
  } catch (error) {
    console.error("Error creating employee:", error.response?.data || error.message);
    throw error;
  }
};

export const updateEmployee = async (id, updates, changedBy, actionTypeId) => {
  try {
    await api.put(`${EMPLOYEE_API}/${id}`, { updates, changedBy, actionTypeId });
  } catch (error) {
    console.error(`Error updating employee ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

export const deactivateEmployee = async (employee, changedBy, actionTypeId) => {
  try {
    await api.put(`${EMPLOYEE_API}/deactivate/${employee.EmployeeID}`, { employee, changedBy, actionTypeId });
  } catch (error) {
    console.error(`Error deactivating employee ${employee.EmployeeID}:`, error.response?.data || error.message);
    throw error;
  }
};

export const reactivateEmployee = async (employee, changedBy, actionTypeId) => {
  try {
    await api.put(`${EMPLOYEE_API}/reactivate/${employee.EmployeeID}`, { employee, changedBy, actionTypeId });
  } catch (error) {
    console.error(`Error reactivating employee ${employee.EmployeeID}:`, error.response?.data || error.message);
    throw error;
  }
};

export const deleteEmployee = async (employee, changedBy, actionTypeId) => {
  try {
    await api.delete(`${EMPLOYEE_API}/${employee.EmployeeID}`, { data: { employee, changedBy, actionTypeId } });
  } catch (error) {
    console.error(`Error deleting employee ${employee.EmployeeID}:`, error.response?.data || error.message);
    throw error;
  }
};
