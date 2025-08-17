import React from "react";
import { Navigate, useParams } from "react-router-dom";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { id: accountId } = useParams();

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {}

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const roles = Array.isArray(user.roles) ? user.roles : [];
  const normalizedRoles = roles.map((r) => r.toLowerCase());
  const isCLevel = normalizedRoles.includes("c-level");

  if (allowedRoles && allowedRoles.length > 0) {
    const allowedLower = allowedRoles.map((r) => r.toLowerCase());
    const hasRoleAccess = allowedLower.some((role) =>
      normalizedRoles.includes(role)
    );
    if (!hasRoleAccess) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  if (accountId && !isCLevel) {
    const ownedAccountIds = user.ownedAccountIds || [];
    const ownsAccount = ownedAccountIds.some(
      (ownedId) => String(ownedId) === String(accountId)
    );
    if (!ownsAccount) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default PrivateRoute;
