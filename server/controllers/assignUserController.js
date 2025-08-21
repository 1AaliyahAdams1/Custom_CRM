const assignedUserService = require("../services/assignUserService");

async function claimAccount(req, res) {
  try {
    const userId = req.user.userId; 
    const accountId = req.params.id;

    await assignedUserService.claimAccount(userId, accountId);

  } catch (err) {
    console.error("Error claiming account:", err);
  }
}

async function assignUser(req, res) {
  try {
    const { userId } = req.body;
    const accountId = req.params.id;

    await assignedUserService.assignUser(userId, accountId);
  } catch (err) {
    console.error("Error assigning user:", err);
  }
}

module.exports = { claimAccount, assignUser };
