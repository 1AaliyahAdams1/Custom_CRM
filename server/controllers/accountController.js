// controllers/accountController.js
const accountService = require("../services/accountService"); // adjust path to match your project

// Get all accounts
async function getAllAccounts(req, res) {
  try {
    const accounts = await accountService.getAllAccounts();
    res.status(200).json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get account details
async function getAccountDetails(req, res) {
  try {
    const account = await accountService.getAccountDetails(req.params.id);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }
    res.status(200).json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Create account
async function createAccount(req, res) {
  try {
    const newAccount = await accountService.createAccount(req.body);
    res.status(201).json(newAccount);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Update account
async function updateAccount(req, res) {
  try {
    const updatedAccount = await accountService.updateAccount(req.params.id, req.body);
    res.status(200).json(updatedAccount);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Deactivate account
async function deactivateAccount(req, res) {
  try {
    const result = await accountService.deactivateAccount(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Reactivate account
async function reactivateAccount(req, res) {
  try {
    const result = await accountService.reactivateAccount(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Delete account
async function deleteAccount(req, res) {
  try {
    const result = await accountService.deleteAccount(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Get active accounts by user
async function getActiveAccountsByUser(req, res) {
  try {
    const accounts = await accountService.getActiveAccountsByUser(req.params.userId);
    res.status(200).json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get active unassigned accounts
async function getActiveUnassignedAccounts(req, res) {
  try {
    const accounts = await accountService.getActiveUnassignedAccounts();
    res.status(200).json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
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
