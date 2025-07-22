const accountService = require("../services/accountService");

// Helper to get changedBy (only from authenticated user)
function getChangedBy(req) {
  return req.user?.username || "UnknownUser";
}

// Get all accounts
async function getAccounts(req, res) {
  try {
    // Validation can go here

    const accounts = await accountService.getAllAccounts();
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Create a new account
async function createAccount(req, res) {
  try {
    // Validation can go here

    const changedBy = getChangedBy(req);
    const newAccount = await accountService.createAccount(req.body, changedBy);
    res.status(201).json(newAccount);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update an existing account by ID
async function updateAccount(req, res) {
  const id = parseInt(req.params.id, 10);

  try {
    // Validation can go here

    const changedBy = getChangedBy(req);
    const updatedAccount = await accountService.updateAccount(id, req.body, changedBy);
    res.json(updatedAccount);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Delete an account by ID
async function deleteAccount(req, res) {
  const id = parseInt(req.params.id, 10);

  try {
    // Validation can go here

    const changedBy = getChangedBy(req);
    const deleted = await accountService.deleteAccount(id, changedBy);
    res.json(deleted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get Account Details for Details Page
async function getAccountDetails(req, res) {
  const id = parseInt(req.params.id, 10);

  try {
    // Validation can go here

    const accountDetails = await accountService.getAccountDetails(id);
    res.json(accountDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountDetails,
};
