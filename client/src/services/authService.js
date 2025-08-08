import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL_ALT;
const AUTH_API = `${BASE_URL}/auth`;

export const login = async (identifier, password) => {
  const response = await axios.post(`${AUTH_API}/login`, { identifier, password });
  return response.data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
