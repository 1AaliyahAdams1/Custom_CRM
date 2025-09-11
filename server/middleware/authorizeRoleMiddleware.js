const { checkOwnership } = require("../utils/auth/checkOwnership");
const dealRoomAccessRepository = require("../data/auth/dealRoomAccessRepository");

/**
 * Role + ownership + deal room access middleware
 * 
 * @param {Array} allowedRoles - roles allowed to access the route
 * @param {Object} options - optional extra checks
 *        options.entityType = "account" | "deal" | "contact" | "activity"
 *        options.requireDealAccess = boolean
 *        options.countryRestricted = boolean
 */
function authorizeRole(allowedRoles = [], options = {}) {
  return async (req, res, next) => {
    try {
      const userRoles = req.user?.roles || [];
      const userId = req.user?.userId;

      // Role check
      const hasRole = allowedRoles.some(role => userRoles.includes(role));
      if (!hasRole) {
        return res.status(403).json({ message: "Forbidden: Insufficient role" });
      }

      // Ownership check (if entityType provided)
      if (options.entityType) {
        const resourceId = req.params.id;
        if (!resourceId) return res.status(400).json({ message: "Missing resource ID" });

        const isOwner = await checkOwnership(options.entityType, resourceId, req.user);
        if (!isOwner) return res.status(403).json({ message: "Forbidden: Not owner of the resource" });
      }

      // Deal room access for Clients
      if (userRoles.includes("Client") && options.requireDealAccess) {
        const dealId = req.params.dealId;
        if (!dealId) return res.status(400).json({ message: "Missing deal ID" });

        const hasAccess = await dealRoomAccessRepository.hasAccess(userId, dealId);
        if (!hasAccess) return res.status(403).json({ message: "Forbidden: No deal room access" });
      }

      // Country restriction for Reporter
      if (userRoles.includes("Reporter") && options.countryRestricted) {
        if (req.query.country && req.query.country !== req.user.country) {
          return res.status(403).json({ message: "Forbidden: Country restricted" });
        }
      }

      next();
    } catch (err) {
      console.error("Authorization middleware error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  };
}

module.exports = { authorizeRole };
