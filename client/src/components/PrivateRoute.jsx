import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const isLoggedIn = !!user;

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Extract roles from user.RoleNames (comma-separated string)
  const userRoles = user?.RoleNames
    ? user.RoleNames.split(",").map(role => role.trim())
    : [];

  // Check if user has any allowed role
  const hasAccess = allowedRoles.some(role => userRoles.includes(role));

  if (allowedRoles && !hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default PrivateRoute;
