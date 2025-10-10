const assignedUserService = require("../services/assignUserService");
const employeeRepository = require("../data/employeeRepository");

// Claim Account
async function claimAccount(req, res) {
  try {
    const userId = req.user?.userId;
    const { id: accountId } = req.params;

    if (!userId || !accountId) {
      return res.status(400).json({ error: "userId and accountId are required" });
    }

    await assignedUserService.claimAccount(userId, accountId);
    res.status(200).json({ message: "Account claimed successfully", accountId, userId });
  } catch (err) {
    console.error("Error claiming account:", err);
    res.status(500).json({ error: err.message || "Failed to claim account" });
  }
}

// Unclaim Account
async function unclaimAccount(req, res) {
  try {
    const userId = req.user?.userId;
    const { id: accountId } = req.params;

    if (!userId || !accountId) {
      return res.status(400).json({ error: "userId and accountId are required" });
    }

    await assignedUserService.unclaimAccount(userId, accountId);
    res.status(200).json({
      message: "Account unclaimed successfully",
      accountId,
      userId,
    });
  } catch (err) {
    console.error("Error unclaiming account:", err);
    res.status(500).json({ error: err.message || "Failed to unclaim account" });
  }
}

// Assign User
async function assignUser(req, res) {
  try {
    const { employeeId } = req.body;
    const { id: accountId } = req.params;

    if (!employeeId) {
      return res.status(400).json({ error: "employeeId is required" });
    }

    const userId = await employeeRepository.getUserIdByEmployeeId(employeeId);
    if (!userId) {
      return res.status(404).json({ error: "No user found for this employee" });
    }

    await assignedUserService.assignUser(userId, accountId);
    res.status(200).json({
      message: "User assigned successfully",
      accountId,
      employeeId,
      userId,
    });
  } catch (err) {
    console.error("Error assigning user:", err);
    res.status(500).json({ error: err.message || "Failed to assign user" });
  }
}

// Remove Assigned User
async function removeAssignedUser(req, res) {
  try {
    const { accountUserId } = req.params;

    if (!accountUserId) {
      return res.status(400).json({ message: "accountUserId is required" });
    }

    await assignedUserService.removeAssignedUser(parseInt(accountUserId, 10));
    res.status(200).json({ message: "Assigned user removed (deactivated or deleted)" });
  } catch (err) {
    console.error("Error removing assigned user:", err);
    res.status(500).json({ message: err.message || "Failed to remove assigned user" });
  }
}

// Remove Multiple Users from Account
const removeSpecificUsers = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { userIds } = req.body;

    if (!accountId) {
      return res.status(400).json({ error: "Account ID is required" });
    }

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: "User IDs array is required" });
    }

    const result = await assignedUserService.removeSpecificUsers(accountId, userIds);
    res.json(result);
  } catch (error) {
    console.error("Error in removeSpecificUsers controller:", error);
    res.status(500).json({
      error: error.message || "Failed to unassign users",
    });
  }
};

module.exports = {
  claimAccount,
  unclaimAccount,
  assignUser,
  removeAssignedUser,
  removeSpecificUsers,
};
