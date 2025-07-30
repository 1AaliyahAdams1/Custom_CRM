import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL_ALT;
const RESOURCE = `${BASE_URL}/accounts`;

// Get all accounts
export const getAllAccounts = () => {
  return axios.get(RESOURCE);
};

// Get active accounts
export const getActiveAccounts = () => {
  return axios.get(`${RESOURCE}/active`);
};

// Get inactive accounts
export const getInactiveAccounts = () => {
  return axios.get(`${RESOURCE}/inactive`);
};

// Get account by ID
export const fetchAccountById = (id) => {
  return axios.get(`${RESOURCE}/${id}`);
};

// Create new account
export const createAccount = (data) => {
  return axios.post(RESOURCE, data);
};

// Update account
export const updateAccount = (id, data) => {
  return axios.put(`${RESOURCE}/${id}`, data);
};

// Deactivate account
export const deactivateAccount = (id) => {
  return axios.patch(`${RESOURCE}/${id}/deactivate`);
};

// Reactivate account
export const reactivateAccount = (id) => {
  return axios.patch(`${RESOURCE}/${id}/reactivate`);
};

// Hard delete account
export const deleteAccount = (id) => {
  return axios.delete(`${RESOURCE}/${id}`);
};
