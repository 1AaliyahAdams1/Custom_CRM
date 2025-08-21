const assignedUserRepository = require("../data/assignedUserRepository");

async function assignUser(userId, accountId) {

  const existingAssignment = await assignedUserRepository.findAssignedUser({
    UserID: userId,
    AccountID: accountId
  });

  if (existingAssignment) {
    throw new Error("User is already assigned to this account");
  }

  await assignedUserRepository.createAssignedUser({
    UserID: userId,
    AccountID: accountId
  });
}

async function claimAccount(userId, accountId) {
  await assignUser(userId, accountId);
}

module.exports = {
  assignUser,
  claimAccount
};