import axios from "axios";

const API = "/api/employees";

export const getAllEmployees = async () => {
  const res = await axios.get(API);
  return res.data;
};

export const getEmployeeById = async (id) => {
  const res = await axios.get(`${API}/${id}`);
  return res.data;
};

export const createEmployee = async (data, changedBy, actionTypeId) => {
  await axios.post(API, { data, changedBy, actionTypeId });
};

export const updateEmployee = async (id, updates, changedBy, actionTypeId) => {
  await axios.put(`${API}/${id}`, { updates, changedBy, actionTypeId });
};

export const deactivateEmployee = async (employee, changedBy, actionTypeId) => {
  await axios.put(`${API}/deactivate/${employee.EmployeeID}`, { employee, changedBy, actionTypeId });
};

export const reactivateEmployee = async (employee, changedBy, actionTypeId) => {
  await axios.put(`${API}/reactivate/${employee.EmployeeID}`, { employee, changedBy, actionTypeId });
};

export const deleteEmployee = async (employee, changedBy, actionTypeId) => {
  await axios.delete(`${API}/${employee.EmployeeID}`, { data: { employee, changedBy, actionTypeId } });
};
