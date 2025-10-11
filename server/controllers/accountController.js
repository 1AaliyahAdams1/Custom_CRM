const accountService = require("../services/accountService");

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
    const userId = req.user?.id || req.user?.userId || req.user?.UserID || 1;
    const newAccount = await accountService.createAccount(req.body, userId);
    res.status(201).json(newAccount);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Update account
async function updateAccount(req, res) {
  try {
    const userId = req.user?.id || req.user?.userId || req.user?.UserID || 1;
    const updatedAccount = await accountService.updateAccount(req.params.id, req.body, userId);
    res.status(200).json(updatedAccount);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Deactivate account
async function deactivateAccount(req, res) {
  try {
    const userId = req.user?.id || req.user?.userId || req.user?.UserID || 1;
    console.log("Deactivate - User ID:", userId);
    console.log("Deactivate - Account ID:", req.params.id);
    const result = await accountService.deactivateAccount(req.params.id, userId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Deactivate error:", error.message);
    res.status(400).json({ message: error.message });
  }
}

// Reactivate account
async function reactivateAccount(req, res) {
  try {
    const userId = req.user?.id || req.user?.userId || req.user?.UserID || 1;
    console.log("Reactivate - User ID:", userId);
    console.log("Reactivate - Account ID:", req.params.id);
    const result = await accountService.reactivateAccount(req.params.id, userId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Reactivate error:", error.message);
    res.status(400).json({ message: error.message });
  }
}

// Delete account
async function deleteAccount(req, res) {
  try {
    const userId = req.user?.id || req.user?.userId || req.user?.UserID || 1;
    const result = await accountService.deleteAccount(req.params.id, userId);
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

async function checkAccountsClaimability(req, res) {
  try {
    // Extract userId from req.user OR req.body (for flexibility)
    const userId = req.user?.id || req.user?.userId || req.user?.UserID || req.body?.userId;
    const { accountIds } = req.body;
    
    if (!Array.isArray(accountIds) || accountIds.length === 0) {
      return res.status(400).json({ message: "Account IDs array is required" });
    }
    
    if (!userId) {
      return res.status(401).json({ message: "User authentication required" });
    }
    
    const result = await accountService.checkAccountsClaimability(accountIds, userId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Check claimability error:", error.message);
    res.status(500).json({ message: error.message });
  }
}

// Bulk claim accounts 
async function bulkClaimAccounts(req, res) {
  try {
    const userId = req.user?.id || req.user?.userId || req.user?.UserID || req.body?.userId;
    const { accountIds } = req.body;
    
    if (!Array.isArray(accountIds) || accountIds.length === 0) {
      return res.status(400).json({ message: "Account IDs array is required" });
    }
    
    if (!userId) {
      return res.status(401).json({ message: "User authentication required. Please log in and try again." });
    }
    
    const result = await accountService.bulkClaimAccounts(accountIds, userId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Bulk claim error:", error.message);
    res.status(400).json({ message: error.message });
  }
}

async function bulkClaimAccountsAndAddSequence(req, res) {
  try {
    const userId = req.user?.id || req.user?.userId || req.user?.UserID || req.body?.userId;
    const { accountIds, sequenceId } = req.body;
    
    if (!Array.isArray(accountIds) || accountIds.length === 0) {
      return res.status(400).json({ message: "Account IDs array is required" });
    }
    
    if (!sequenceId) {
      return res.status(400).json({ message: "Sequence ID is required" });
    }
    
    if (!userId) {
      return res.status(401).json({ 
        message: "User authentication required. Please log in and try again." 
      });
    }
    
    const result = await accountService.bulkClaimAccountsAndAddSequence(
      accountIds, 
      userId, 
      sequenceId
    );
    
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function assignSequenceToAccount(req, res) {
  try {
    const userId = req.user?.id || req.user?.userId || req.user?.UserID || req.body?.userId;
    const { sequenceId } = req.body;
    const accountId = req.params.id;
    
    if (!accountId) {
      return res.status(400).json({ message: "Account ID is required" });
    }
    
    if (!sequenceId) {
      return res.status(400).json({ message: "Sequence ID is required" });
    }
    
    if (!userId) {
      return res.status(401).json({ 
        message: "User authentication required. Please log in and try again." 
      });
    }
    
    const result = await accountService.assignSequenceToAccount(
      accountId, 
      sequenceId,
      userId
    );
    
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
  getActiveUnassignedAccounts,
  checkAccountsClaimability,
  bulkClaimAccounts,
  bulkClaimAccountsAndAddSequence,
   assignSequenceToAccount,
};