import React, { createContext, useState, useEffect, useContext } from "react";
import { fetchUserRoles } from "../../services/auth/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRoles() {
      console.log("=== AuthContext Loading Roles ===");
      try {
        // Check if user is logged in first
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");
        
        console.log("Token exists:", !!token);
        console.log("User exists:", !!user);
        
        if (!token) {
          console.log("No token found, setting loading to false");
          setLoading(false);
          return;
        }

        console.log("Fetching roles from API...");
        const fetchedRoles = await fetchUserRoles();
        console.log("Fetched roles:", fetchedRoles);
        setRoles(fetchedRoles);
      } catch (err) {
        console.error("Failed to load roles", err);
        console.log("Error details:", {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data
        });
        
        // Clear invalid token if API call fails
        if (err.message === "No token found" || err.response?.status === 401) {
          console.log("Clearing invalid auth data");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setRoles([]);
        }
      } finally {
        console.log("Setting loading to false");
        setLoading(false);
      }
    }
    loadRoles();
  }, []);

  const contextValue = { roles, loading, setRoles, setLoading };
  console.log("AuthContext providing value:", contextValue);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.warn("useAuth must be used within an AuthProvider");
    return null;
  }
  return context;
};