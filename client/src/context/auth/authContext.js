import React, { createContext, useState, useEffect } from "react";
import { fetchUserRoles } from "../../services/auth/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRoles() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }
        const fetchedRoles = await fetchUserRoles();
        setRoles(fetchedRoles);
      } catch (err) {
        if (err.message === "No token found" || err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setRoles([]);
        }
      } finally {
        setLoading(false);
      }
    }
    loadRoles();
  }, []);

  return (
    <AuthContext.Provider value={{ roles, loading, setRoles, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
