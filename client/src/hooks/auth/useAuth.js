import { useContext } from "react";
import { AuthContext } from "../../context/auth/authContext";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  const refreshRoles = async () => {
    const { fetchUserRoles } = await import("../../services/auth/authService");
    try {
      context.setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        context.setRoles([]);
        return;
      }
      const fetchedRoles = await fetchUserRoles();
      context.setRoles(fetchedRoles);
    } catch (err) {
      console.error("Error refreshing roles:", err);
      if (err.message === "No token found" || err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        context.setRoles([]);
      }
    } finally {
      context.setLoading(false);
    }
  };
  
  return { ...context, refreshRoles };
};