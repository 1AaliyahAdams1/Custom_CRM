import { createContext, useState, useEffect } from "react";
import * as authService from "../../services/auth/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Initialize from localStorage if available
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
          setUser({ ...userData, token, roles });
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
    setUser({ ...userData, token, roles });
    return response;
  };

  // Logout
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
