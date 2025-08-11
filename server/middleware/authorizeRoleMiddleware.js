const { checkOwnership } = require("../utils/auth/checkOwnership"); // import your util

function authorizeRoleDynamic(allowedRoles = [], entityType = null) {
  return async (req, res, next) => {
    try {
      const userRoles = req.user?.roles || [];

      // Role match check
      console.log("User roles from token:", req.user.roles);
console.log("Allowed roles for route:", allowedRoles);

      const hasRole = allowedRoles.some(role => userRoles.includes(role));
      if (!hasRole) {
        return res.status(403).json({ message: "Forbidden: Insufficient role" });
      }

      // Ownership check if role is Sales Representative
      if (userRoles.includes("Sales Representative") && entityType) {
        const resourceId = req.params.id;
        if (!resourceId) {
          return res.status(400).json({ message: "Missing resource ID" });
        }

        const isOwner = await checkOwnership(entityType, resourceId, req.user.userId);
        if (!isOwner) {
          return res.status(403).json({ message: "Forbidden: Not owner of the resource" });
        }
      }

      // TODO: Add region/territory/account ownership checks here if needed

      next();
    } catch (err) {
      console.error("Authorization middleware error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  };
}

module.exports = { authorizeRoleDynamic };
