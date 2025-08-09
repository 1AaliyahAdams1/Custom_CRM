const Roles = {
  SALESPERSON: "Salesperson",
  // add other roles as needed
};

function authorizeRoleDynamic(allowedRoles = [], entityType) {
  return async (req, res, next) => {
    try {
      const userRoles = req.user?.roles || [];

      // Check if user has any allowed role
      const hasRole = allowedRoles.some(role => userRoles.includes(role));
      if (!hasRole) {
        return res.status(403).json({ message: "Forbidden: Insufficient role" });
      }

      // If user is Salesperson, verify ownership
      if (userRoles.includes(Roles.SALESPERSON)) {
        const resourceId = req.params.id;
        if (!resourceId) {
          return res.status(400).json({ message: "Missing resource ID" });
        }
        const isOwner = await checkOwnership(entityType, resourceId, req.user.userId);
        if (!isOwner) {
          return res.status(403).json({ message: "Forbidden: Not owner of the resource" });
        }
      }

      // TODO: Add other hierarchy or region checks here as needed

      next();
    } catch (err) {
      console.error("Authorization middleware error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  };
}

// Example stub for ownership check - implement this to query your DB
async function checkOwnership(entityType, resourceId, userId) {
  
  return true; 
}

module.exports = authorizeRoleDynamic;
