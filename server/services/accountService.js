const accountRepository = require("../data/accountRepository");

// Helper to get changedBy, default to "System" if not passed
function getChangedByOrDefault(changedBy) {
  return changedBy || "System";
}

async function getAllAccounts() {
  // Business logic for filtering, pagination, or permissions
  // could be added here before or after fetching data
  return await accountRepository.getAllAccounts();
}

async function getAccountDetails(id) {
  // Business logic like access control, data transformation,
  // or enriching details could be added here
  return await accountRepository.getAccountDetails(id);
}

async function createAccount(accountData, changedBy) {
  const user = getChangedByOrDefault(changedBy);

  // Business logic to validate input data, enforce rules,
  // or modify data before creation goes here

  return await accountRepository.createAccount(accountData, user);
}

async function updateAccount(id, accountData, changedBy) {
  const user = getChangedByOrDefault(changedBy);

  // Business logic to validate updates, check permissions,
  // or handle side effects could be added here

  return await accountRepository.updateAccount(id, accountData, user);
}

async function deleteAccount(id, changedBy) {
  const user = getChangedByOrDefault(changedBy);

  // Business logic to prevent deletion, cascade deletes,
  // or archive data can be added here

  return await accountRepository.deleteAccount(id, user);
}

module.exports = {
  getAllAccounts,
  getAccountDetails,
  createAccount,
  updateAccount,
  deleteAccount,
};
