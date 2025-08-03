const accountRepo = require("../data/accountRepository");

// Hardcoded userId for now
const userId = 1;


async function getAllAccounts() {
  return await accountRepo.getAllAccounts();
}


async function getAccountById(id) {
  return await accountRepo.getAccountDetails(id);
}


async function createAccount(data) {
  return await accountRepo.createAccount(data, userId);
}


async function updateAccount(id, data) {
  return await accountRepo.updateAccount(id, data, userId);
}

async function deactivateAccount(id) {
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

// Reactivate an account
async function reactivateAccount(id) {
  return await accountRepo.reactivateAccount(id, userId);
}

// Hard delete an account
async function deleteAccount(id) {
  return await accountRepo.deleteAccount(id, userId);
}

module.exports = {
  getAllAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deactivateAccount,
  reactivateAccount,
  deleteAccount,
};
