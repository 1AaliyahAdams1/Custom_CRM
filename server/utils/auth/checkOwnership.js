const db = require("../../dbConfig");

/**
 * Checks if a user has ownership/access to a resource based on entityType.
 * Supports role-based exceptions (Sales Management, Customer Support, etc.)
 *
 * @param {string} entityType - account, deal, contact, activity
 * @param {number|string} resourceId
 * @param {object} user - user object { userId, roles }
 * @returns {boolean}
 */
async function checkOwnership(entityType, resourceId, user) {
  const { userId, roles } = user;

  // Clevel can access everything
  if (roles.includes("C-level") || roles.includes("HR")) return true;

  switch (entityType.toLowerCase()) {
    case "account": {
      // Sales Rep → only assigned accounts
      if (roles.includes("Sales Representative")) {
        const record = await db("AssignedUser")
          .where({
            UserID: userId,
            AccountID: resourceId,
            Active: 1,
          })
          .first();
        return !!record;
      }

      // Sales Management → assigned accounts + team accounts
      if (roles.includes("Sales Manager")) {
        const record = await db("AssignedUser")
          .where({ AccountID: resourceId, Active: 1 })
          .andWhere(builder => builder.where("UserID", userId).orWhere("TeamLeadID", userId));
        return !!record;
      }

      // Customer Support → selected accounts
      if (roles.includes("Customer Support")) {
        const record = await db("SupportAccess")
          .where({ AccountID: resourceId, UserID: userId, Active: 1 })
          .first();
        return !!record;
      }

      return false;
    }

    case "deal": {
      // Only consider assigned account access
      const record = await db("Deal as d")
        .join("Account as a", "d.AccountID", "a.AccountID")
        .join("AssignedUser as au", "a.AccountID", "au.AccountID")
        .where({
          "d.DealID": resourceId,
          "au.UserID": userId,
          "au.Active": 1,
        })
        .first();
      return !!record;
    }

    case "contact": {
      const record = await db("Contact as c")
        .join("Account as a", "c.AccountID", "a.AccountID")
        .join("AssignedUser as au", "a.AccountID", "au.AccountID")
        .where({
          "c.ContactID": resourceId,
          "au.UserID": userId,
          "au.Active": 1,
        })
        .first();
      return !!record;
    }

    case "activity": {
      const record = await db("Activity as act")
        .join("Account as a", "act.AccountID", "a.AccountID")
        .join("AssignedUser as au", "a.AccountID", "au.AccountID")
        .where({
          "act.ActivityID": resourceId,
          "au.UserID": userId,
          "au.Active": 1,
        })
        .first();
      return !!record;
    }

    default:
      return false;
  }
}

module.exports = { checkOwnership };
