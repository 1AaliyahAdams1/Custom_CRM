const accountRepo = require("../data/accountRepository");


// Hardcoded userId for now
const userId = 1;


async function getAllAccounts() {
  return await accountRepo.getAllAccounts();
}


async function getAccountDetails(id) {
  return await accountRepo.getAccountDetails(id);
}


async function createAccount(data) {
  return await accountRepo.createAccount(data, userId);
}


async function updateAccount(id, data) {
  return await accountRepo.updateAccount(id, data, userId);
}

async function deactivateAccount(id, userId) {  // Added userId parameter
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



async function deleteAccount(id) {
  return await accountRepo.deleteAccount(id, userId);
}


async function getActiveAccountsByUser(userId) {
  return await accountRepo.getActiveAccountsByUser(userId);
}

async function getActiveUnassignedAccounts() {
  return await accountRepo.getActiveUnassignedAccounts();
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
  getActiveUnassignedAccounts
};