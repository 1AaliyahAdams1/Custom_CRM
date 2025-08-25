import React from "react";
import { Navigate, useParams, useLocation } from "react-router-dom";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { id } = useParams();
  const location = useLocation();

  // 1) Read user
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {}

  if (!user) return <Navigate to="/login" replace />;

  // 2) Role check (case-insensitive)
  const roles = Array.isArray(user.roles) ? user.roles : [];
  const normalizedRoles = roles.map(r => (r || "").toLowerCase().trim());
  const isCLevel = normalizedRoles.includes("c-level");

  if (allowedRoles?.length) {
    const allowedLower = allowedRoles.map(r => (r || "").toLowerCase().trim());
    const hasRoleAccess = allowedLower.some(role => normalizedRoles.includes(role));
    if (!hasRoleAccess) return <Navigate to="/unauthorized" replace />;
  }

  // 3) Ownership check ONLY for /accounts/:id (not for contacts/deals/activities)
  const isAccountsDetailRoute =
    location.pathname.startsWith("/accounts/") && !!id && !location.pathname.includes("/create");

  if (isAccountsDetailRoute && !isCLevel) {
    const ownedAccountIds = Array.isArray(user.ownedAccountIds) ? user.ownedAccountIds : [];

    // Safety: if we don't know ownership yet, don't block falsely.
    if (ownedAccountIds.length > 0) {
      const ownsAccount = ownedAccountIds.some(ownedId => String(ownedId) === String(id));
      if (!ownsAccount) return <Navigate to="/unauthorized" replace />;
    }
    // If length === 0, we skip blocking here. (Step 2 will populate it.)
  }

  return children;
};

export default PrivateRoute;
