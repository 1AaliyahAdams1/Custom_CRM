import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL_ALT;
const AUTH_API = `${BASE_URL}/auth`;

// Login
export const login = async (identifier, password) => {
  const response = await axios.post(`${AUTH_API}/login`, { identifier, password });
  return response.data;
};

// Logout
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// Fetch user permissions
export const fetchUserPermissions = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const res = await axios.get(`${AUTH_API}/permissions`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  return res.data.permissions; 
};
