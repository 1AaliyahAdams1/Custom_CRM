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


async function removeAssignedUser(accountUserId) {
  try {
    await assignedUserRepository.deactivateAssignedUser(accountUserId);
    await assignedUserRepository.deleteAssignedUser(accountUserId);
  } catch (err) {
    console.warn("Deleting failed", err.message);
  }
}



// Remove specific users from an account
async function removeSpecificUsers(accountId, userIds) {
  try {
    // Get all active assignments for this account
    const assignments = await assignedUserRepository.findAssignedUsersByAccount(accountId);
    
    // Filter to get only the assignments we want to remove
    const assignmentsToRemove = assignments.filter(assignment => 
      userIds.includes(String(assignment.UserID)) || userIds.includes(Number(assignment.UserID))
    );
    
    if (assignmentsToRemove.length === 0) {
      throw new Error("No matching assignments found for the specified users");
    }
    
    // Remove each assignment using the existing removeAssignedUser function
    const removePromises = assignmentsToRemove.map(assignment => 
      removeAssignedUser(assignment.AccountUserID)
    );
    
    await Promise.all(removePromises);
    
    return {
      success: true,
      removedCount: assignmentsToRemove.length,
      message: `Successfully unassigned ${assignmentsToRemove.length} user(s)`
    };
  } catch (err) {
    console.error("Error removing specific users:", err);
    throw err;
  }
}

module.exports = {
  assignUser,
  claimAccount,
  removeAssignedUser,
  removeSpecificUsers,

};