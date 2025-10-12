const accountRepo = require("../data/accountRepository");

async function getAllAccounts() {
  return await accountRepo.getAllAccounts();
}

async function getAccountDetails(id) {
  return await accountRepo.getAccountDetails(id);
}

async function createAccount(data, userId) {
  return await accountRepo.createAccount(data, userId);
}

async function updateAccount(id, data, userId) {
  return await accountRepo.updateAccount(id, data, userId);
}

async function deactivateAccount(id, userId) {
  const account = await accountRepo.getAccountDetails(id);
  if (!account) {
    throw new Error("Account not found");
  }

  if (!account.Active) {
    throw new Error("Account is already deactivated");
  }

  account.Active = false;

  return await accountRepo.deactivateAccount(account, userId, 7);
}

async function reactivateAccount(id, userId) {  
  return await accountRepo.reactivateAccount(id, userId);
}

async function deleteAccount(id, userId) {
  return await accountRepo.deleteAccount(id, userId);
}

async function getActiveAccountsByUser(userId) {
  return await accountRepo.getActiveAccountsByUser(userId);
}

async function getActiveUnassignedAccounts() {
  return await accountRepo.getActiveUnassignedAccounts();
}

async function checkAccountsClaimability(accountIds, userId) {
  if (!Array.isArray(accountIds) || accountIds.length === 0) {
    throw new Error("Account IDs array is required");
  }
  
  if (!userId) {
    throw new Error("User ID is required");
  }
  
  return await accountRepo.checkAccountsClaimability(accountIds, userId);
}

async function bulkClaimAccounts(accountIds, userId) {
  if (!Array.isArray(accountIds) || accountIds.length === 0) {
    throw new Error("Account IDs array is required");
  }
  if (!userId) {
    throw new Error("User ID is required");
  } 
  return await accountRepo.bulkClaimAccounts(accountIds, userId);
}

async function bulkClaimAccountsAndAddSequence(accountIds, userId, sequenceId) {
  if (!Array.isArray(accountIds) || accountIds.length === 0) {
    throw new Error("Account IDs array is required");
  }
  
  if (!userId) {
    throw new Error("User ID is required");
  }
  
  if (!sequenceId) {
    throw new Error("Sequence ID is required");
  }
  
  return await accountRepo.bulkClaimAccountsAndAddSequence(accountIds, userId, sequenceId);
}

async function assignSequenceToAccount(accountId, sequenceId, userId) {
  if (!accountId) {
    throw new Error("Account ID is required");
  }
  
  if (!sequenceId) {
    throw new Error("Sequence ID is required");
  }
  
  if (!userId) {
    throw new Error("User ID is required");
  }
  
  return await accountRepo.bulkClaimAccountsAndAddSequence([accountId], userId, sequenceId);
}


module.exports = {
  getAllAccounts,
  getAccountDetails,
  createAccount,
  updateAccount,
  deactivateAccount,
  reactivateAccount,
  deleteAccount,
  getActiveAccountsByUser,
  getActiveUnassignedAccounts,
  checkAccountsClaimability,
  bulkClaimAccounts,
  bulkClaimAccountsAndAddSequence,
  assignSequenceToAccount,
};