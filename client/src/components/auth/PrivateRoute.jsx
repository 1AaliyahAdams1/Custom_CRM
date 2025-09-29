import React, { useContext } from "react";
import { Navigate, useParams, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/auth/authContext";

const PrivateRoute = ({ children, allowedRoles = [], entityType = null }) => {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace />;

  const roles = Array.isArray(user.roles) ? user.roles : [];
  const normalizedRoles = roles.map(r => r.toLowerCase().trim());

  if (allowedRoles.length > 0) {
    const allowedLower = allowedRoles.map(r => r.toLowerCase().trim());
    const hasRole = allowedLower.some(r => normalizedRoles.includes(r));
    if (!hasRole) return <Navigate to="/unauthorized" replace />;
  }

  if (entityType && id && user[`owned${capitalize(entityType)}Ids`]?.length > 0) {
    const ownedIds = user[`owned${capitalize(entityType)}Ids`];
    const ownsEntity = ownedIds.some(ownedId => String(ownedId) === String(id));
    if (!ownsEntity) return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default PrivateRoute;
