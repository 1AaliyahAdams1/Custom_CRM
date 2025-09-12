import { createContext, useState, useEffect } from "react";
import * as authService from "../../services/auth/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [loading, setLoading] = useState(true);

  // Load user roles on mount if token exists
  useEffect(() => {
    const loadUserRoles = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const roles = await authService.fetchUserRoles();
          const storedUser = localStorage.getItem("user");
          const userData = storedUser ? JSON.parse(storedUser) : {};
          setUser({
            ...userData,
            token,
            roles: Array.isArray(roles) ? roles : [], 
          });
        } catch (error) {
          console.error("Failed to fetch user roles:", error);
          setUser(null);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
      setLoading(false);
    };

    loadUserRoles();
  }, []);

  // Login function using your service
  const login = async (identifier, password) => {
    const response = await authService.login(identifier, password);
    const { token, user: userData, roles } = response;

    const userToStore = {
      ...userData,
      token,
      roles: Array.isArray(roles) ? roles : [],
      RoleNames: Array.isArray(roles) ? roles.join(", ") : "",
    };

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userToStore));

    setUser(userToStore);
    return response;
  };

  // Logout
  const logout = () => {
    authService.logout();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // Refresh roles
  const refreshRoles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(prev => ({ ...prev, roles: [] }));
        return;
      }
      const fetchedRoles = await authService.fetchUserRoles();
      setUser(prev => ({
        ...prev,
        roles: Array.isArray(fetchedRoles) ? fetchedRoles : [],
      }));
    } catch (err) {
      console.error("Error refreshing roles:", err);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(prev => ({ ...prev, roles: [] }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, refreshRoles, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
