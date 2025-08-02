const accountService = require("../services/accountService");

// List all accounts
async function getAllAccounts(req, res) {
  try {
    const accounts = await accountService.listAllAccounts();
    res.json(accounts);
  } catch (err) {
    console.error("Error getting all accounts:", err);
    res.status(500).json({ error: "Failed to get accounts" });
  }
}

// Get account by ID
async function getAccountById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid account ID" });

    const account = await accountService.getAccountById(id);
    if (!account) return res.status(404).json({ error: "Account not found" });

    res.json(account);
  } catch (err) {
    console.error("Error getting account by ID:", err);
    res.status(500).json({ error: "Failed to get account" });
  }
}

// Create account
async function createAccount(req, res) {
  try {
    const newAccount = await accountService.createAccount(req.body);
    res.status(201).json(newAccount);
  } catch (err) {
    console.error("Error creating account:", err);
    res.status(500).json({ error: "Failed to create account" });
  }
}

// Update account
async function updateAccount(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid account ID" });

    const updated = await accountService.updateAccount(id, req.body);
    res.json(updated);
  } catch (err) {
    console.error("Error updating account:", err);
    res.status(500).json({ error: "Failed to update account" });
  }
}

// Deactivate account (soft delete) - Fixed to match controller pattern
async function deactivateAccount(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid account ID" });

    const result = await accountService.deactivateAccount(id);
    res.json(result);
  } catch (err) {
    console.error("Error deactivating account:", err);
    
    // Handle specific error messages from service layer
    if (err.message === "Account not found") {
      return res.status(404).json({ error: err.message });
    }
    if (err.message === "Account is already deactivated") {
      return res.status(400).json({ error: err.message });
    }
    
    res.status(500).json({ error: "Failed to deactivate account" });
  }
}

// Reactivate account
async function reactivateAccount(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid account ID" });

    const result = await accountService.reactivateAccount(id);
    res.json(result);
  } catch (err) {
    console.error("Error reactivating account:", err);
    
    // Handle specific error messages from service layer
    if (err.message === "Account not found") {
      return res.status(404).json({ error: err.message });
    }
    if (err.message === "Account is already active") {
      return res.status(400).json({ error: err.message });
    }
    
    res.status(500).json({ error: "Failed to reactivate account" });
  }
}

// Delete account (hard delete)
async function deleteAccount(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid account ID" });

    const result = await accountService.deleteAccount(id);
    res.json(result);
  } catch (err) {
    console.error("Error deleting account:", err);
    
    // Handle specific error messages from service layer
    if (err.message === "Account not found") {
      return res.status(404).json({ error: err.message });
    }
    if (err.message === "Account must be deactivated before permanent deletion") {
      return res.status(400).json({ error: err.message });
    }
    
    res.status(500).json({ error: "Failed to delete account" });
  }
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