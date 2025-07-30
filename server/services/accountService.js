const accountRepo = require("../data/accountRepository");

// Get all accounts
async function listAllAccounts() {
  return await accountRepo.getAllAccounts();
}

// Get only active accounts
async function listActiveAccounts() {
  return await accountRepo.getActiveAccounts();
}

// Get only inactive accounts
async function listInactiveAccounts() {
  return await accountRepo.getInactiveAccounts();
}

// Get account by ID
async function getAccountById(id) {
  return await accountRepo.getAccountDetails(id);
}

// Create a new account
async function createNewAccount(data, userId) {
  return await accountRepo.createAccount(data, userId);
}

// Update an existing account
async function updateExistingAccount(id, data, userId) {
  return await accountRepo.updateAccount(id, data, userId);
}

// Soft delete an account
async function deactivateExistingAccount(id, userId) {
  return await accountRepo.deactivateAccount(id, userId);
}

// Reactivate an account
async function reactivateExistingAccount(id, userId) {
  return await accountRepo.reactivateAccount(id, userId);
}

// Hard delete an account
async function deleteAccountPermanently(id, userId) {
  return await accountRepo.deleteAccount(id, userId);
}

module.exports = {
  listAllAccounts,
  listActiveAccounts,
  listInactiveAccounts,
  getAccountById,
  createNewAccount,
  updateExistingAccount,
  deactivateExistingAccount,
  reactivateExistingAccount,
  deleteAccountPermanently
};
