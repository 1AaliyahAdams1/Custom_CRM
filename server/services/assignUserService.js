// services/assignedUserService.js
const assignedUserRepo = require("../data/assignedUserRepository");

// Sales rep claims an account
async function claimAccount(userId, accountId) {
  const exists = await assignedUserRepo.findAssignedUser({ AccountID: accountId, UserID: userId });
  if (exists) throw new Error("You have already claimed this account");

  return assignedUserRepo.createAssignedUser({ UserID: userId, AccountID: accountId });
}

// C-level assigns a specific user
async function assignUser(userId, accountId) {
  const exists = await assignedUserRepo.findAssignedUser({ AccountID: accountId, UserID: userId });
  if (exists) throw new Error("User already assigned to this account");

  return assignedUserRepo.createAssignedUser({ UserID: userId, AccountID: accountId });
}

module.exports = {
  claimAccount,
  assignUser,
};
