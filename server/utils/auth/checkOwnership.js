const db = require("../../dbConfig"); 

async function checkOwnership(entityType, resourceId, userId) {
  switch (entityType.toLowerCase()) {
    case "account": {
      const record = await db("AssignedUser")
        .where({
          UserID: userId,
          AccountID: resourceId,
          Active: 1
        })
        .first();
      return !!record;
    }

    case "deal": {
      const record = await db("Deal as d")
        .join("Account as a", "d.AccountID", "a.AccountID")
        .join("AssignedUser as au", "a.AccountID", "au.AccountID")
        .where({
          "d.DealID": resourceId,
          "au.UserID": userId,
          "au.Active": 1
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
          "au.Active": 1
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
          "au.Active": 1
        })
        .first();
      return !!record;
    }

    default:
      return false;
  }
}

module.exports = { checkOwnership };
