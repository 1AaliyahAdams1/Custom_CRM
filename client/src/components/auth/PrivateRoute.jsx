import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuth";

const PrivateRoute = ({ children, allowedRoles }) => {
  // Get user from localStorage first
  let user = null;
  try {
    const userString = localStorage.getItem("user");
    user = userString ? JSON.parse(userString) : null;
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
  }
  
  const isLoggedIn = !!user;

  // Call the hook unconditionally
  const authContext = useAuth();

  // Debug logging
  console.group("=== PrivateRoute Debug ===");
  console.log("Current URL:", window.location.pathname);
  console.log("User from localStorage:", user);
  console.log("Is logged in:", isLoggedIn);
  console.log("Auth context available:", !!authContext);
  console.log("Allowed roles for this route:", allowedRoles);

  if (authContext) {
    console.log("Auth context details:", {
      roles: authContext.roles,
      loading: authContext.loading,
      contextType: typeof authContext
    });
  }

  // Fallback logic if authContext is null or undefined (rare)
  if (!authContext) {
    console.warn("No auth context available, using localStorage fallback");

    let userRoles = [];

    if (user?.RoleNames) {
      userRoles = typeof user.RoleNames === 'string' 
        ? user.RoleNames.split(', ').map(role => role.trim())
        : Array.isArray(user.RoleNames) ? user.RoleNames : [];
    } else if (user?.roles) {
      userRoles = Array.isArray(user.roles) ? user.roles : [];
    }

    console.log("Fallback user roles:", userRoles);

    if (!isLoggedIn) {
      console.log("Not logged in, redirecting to login");
      console.groupEnd();
      return <Navigate to="/login" replace />;
    }

    if (allowedRoles && allowedRoles.length > 0) {
      const hasAccess = allowedRoles.some(role => userRoles.includes(role));
      if (!hasAccess) {
        console.log("Access denied, redirecting to unauthorized");
        console.groupEnd();
        return <Navigate to="/unauthorized" replace />;
      }
    }

    console.log("Access granted (fallback), rendering children");
    console.groupEnd();
    return children;
  }

  // Using authContext when available
  const { roles, loading } = authContext;

  console.log("Context roles:", roles);
  console.log("Loading state:", loading);

  if (loading) {
    console.log("Still loading, showing loading screen");
    console.groupEnd();
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    console.log("Not logged in (with context), redirecting to login");
    console.groupEnd();
    return <Navigate to="/login" replace />;
  }

  const userRoles = Array.isArray(roles) ? roles : [];
  console.log("Final user roles:", userRoles);

  if (allowedRoles && allowedRoles.length > 0) {
    const hasAccess = allowedRoles.some(role => userRoles.includes(role));
    if (!hasAccess) {
      console.log("Access denied (context), redirecting to unauthorized");
      console.groupEnd();
      return <Navigate to="/unauthorized" replace />;
    }
  }

  console.log("Access granted, rendering children");
  console.groupEnd();
  return children;
};

export default PrivateRoute;
