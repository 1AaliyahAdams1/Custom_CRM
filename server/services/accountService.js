const accountRepo = require("../data/accountRepository");

// Hardcoded userId for now
const userId = 1;

// Get all accounts
async function listAllAccounts() {
  return await accountRepo.getAllAccounts();
}

// Get account by ID
async function getAccountById(id) {
  return await accountRepo.getAccountDetails(id);
}

// Create a new account
async function createAccount(data) {
  // Basic validation
  if (!data.AccountName || !data.AccountName.trim()) {
    throw new Error("Account name is required");
  }
  
  return await accountRepo.createAccount(data, userId);
}

// Update an existing account
async function updateAccount(id, data) {
  // Basic validation
  if (!data.AccountName || !data.AccountName.trim()) {
    throw new Error("Account name is required");
  }
  
  return await accountRepo.updateAccount(id, data, userId);
}

// Soft delete (deactivate) an account - Fixed to remove req/res handling
async function deactivateAccount(id) {
  // Fetch existing account
  const account = await accountRepo.getAccountDetails(id);
  if (!account) {
    throw new Error("Account not found");
  }

  if (!account.Active) {
    throw new Error("Account is already deactivated");
  }

  // Set active to false for soft delete
  account.Active = false;

  // Call repo to update and log deactivation
  return await accountRepo.deactivateAccount(account, userId, 7); // 7 = Deactivate actionTypeId
}

// Reactivate an account
async function reactivateAccount(id) {
  return await accountRepo.reactivateAccount(id, userId);
}

// Hard delete an account
async function deleteAccount(id) {
  return await accountRepo.deleteAccount(id, userId);
}

module.exports = {
  listAllAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deactivateAccount,
  reactivateAccount,
  deleteAccount,
};