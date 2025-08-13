const accountService = require("../services/accountService");

// Validation helper functions
function validateId(id) {
  // Check if ID is provided
  if (!id) {
    throw new Error("ID is required");
  }
  
  // Check if ID is a valid format (assuming it's a number or UUID)
  if (isNaN(id) && !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id)) {
    throw new Error("Invalid ID format");
  }
  
  return true;
}

function validateAccountData(data, isUpdate = false) {
  const errors = [];
  
  // Required fields for creation (optional for updates)
  if (!isUpdate || data.name !== undefined) {
    if (!data.name || typeof data.name !== 'string') {
      errors.push("Name is required and must be a string");
    } else if (data.name.trim().length < 2 || data.name.trim().length > 100) {
      errors.push("Name must be between 2 and 100 characters");
    }
  }
  
  if (!isUpdate || data.email !== undefined) {
    if (!data.email || typeof data.email !== 'string') {
      errors.push("Email is required and must be a string");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push("Invalid email format");
      }
    }
  }
  
  // Optional fields validation
  if (data.phone && typeof data.phone === 'string') {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(data.phone.replace(/[\s\-\(\)]/g, ''))) {
      errors.push("Invalid phone number format");
    }
  }
  
  if (data.website && typeof data.website === 'string') {
    const urlRegex = /^https?:\/\/.+\..+/;
    if (!urlRegex.test(data.website)) {
      errors.push("Invalid website URL format");
    }
  }
  
  if (data.industry && typeof data.industry !== 'string') {
    errors.push("Industry must be a string");
  }
  
  if (data.company_size !== undefined) {
    if (!Number.isInteger(data.company_size) || data.company_size < 1) {
      errors.push("Company size must be a positive integer");
    }
  }
  
  // Check for unexpected fields
  const allowedFields = ['name', 'email', 'phone', 'website', 'industry', 'company_size', 'description', 'address'];
  const unexpectedFields = Object.keys(data).filter(key => !allowedFields.includes(key));
  if (unexpectedFields.length > 0) {
    errors.push(`Unexpected fields: ${unexpectedFields.join(', ')}`);
  }
  
  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join('; ')}`);
  }
  
  return true;
}

function sanitizeInput(data) {
  const sanitized = {};
  
  // Sanitize string fields
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = value.trim();
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

// List all accounts
async function getAllAccounts(req, res) {
  try {
    // Validate query parameters if any
    const { page, limit, status } = req.query;
    
    if (page && (isNaN(page) || page < 1)) {
      return res.status(400).json({ error: "Page must be a positive number" });
    }
    
    if (limit && (isNaN(limit) || limit < 1 || limit > 100)) {
      return res.status(400).json({ error: "Limit must be between 1 and 100" });
    }
    
    if (status && !['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: "Status must be 'active' or 'inactive'" });
    }
    
    const accounts = await accountService.getAllAccounts(req.query);
    res.json(accounts);
  } catch (err) {
    console.error("Error getting all accounts:", err);
    res.status(500).json({ error: "Failed to get accounts" });
  }
}

// Get account by ID
async function getAccountDetails(req, res) {
  try {
    const id = req.params.id;
    const account = await accountService.getAccountDetails(id);
    if (!account) return res.status(404).json({ error: "Account not found" });
    res.json(account);
  } catch (err) {
    console.error("Error getting account by ID:", err);
    
    // Handle validation errors
    if (err.message.includes("ID is required") || err.message.includes("Invalid ID format")) {
      return res.status(400).json({ error: err.message });
    }
    
    res.status(500).json({ error: "Failed to get account" });
  }
}

// Create account
async function createAccount(req, res) {
  try {
    // Check if request body exists
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Request body is required" });
    }
    
    // Validate account data
    validateAccountData(req.body, false);
    
    // Sanitize input
    const sanitizedData = sanitizeInput(req.body);
    
    const newAccount = await accountService.createAccount(sanitizedData);
    res.status(201).json(newAccount);
  } catch (err) {
    console.error("Error creating account:", err);
    
    // Handle validation errors
    if (err.message.includes("Validation errors")) {
      return res.status(400).json({ error: err.message });
    }
    
    // Handle duplicate errors (assuming service throws specific error)
    if (err.message.includes("already exists") || err.message.includes("duplicate")) {
      return res.status(409).json({ error: err.message });
    }
    
    res.status(500).json({ error: "Failed to create account" });
  }
}

// Update account
async function updateAccount(req, res) {
  try {
    const id = req.params.id;
    
    // Validate ID
    validateId(id);
    
    // Check if request body exists
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Request body is required" });
    }
    
    // Validate account data (for updates)
    validateAccountData(req.body, true);
    
    // Sanitize input
    const sanitizedData = sanitizeInput(req.body);
    
    const updated = await accountService.updateAccount(id, sanitizedData);
    if (!updated) {
      return res.status(404).json({ error: "Account not found" });
    }
    res.json(updated);
  } catch (err) {
    console.error("Error updating account:", err);
    
    // Handle validation errors
    if (err.message.includes("ID is required") || err.message.includes("Invalid ID format") || err.message.includes("Validation errors")) {
      return res.status(400).json({ error: err.message });
    }
    
    // Handle duplicate errors
    if (err.message.includes("already exists") || err.message.includes("duplicate")) {
      return res.status(409).json({ error: err.message });
    }
    
    res.status(500).json({ error: "Failed to update account" });
  }
}

// Deactivate account
async function deactivateAccount(req, res) {
  try {
    const id = req.params.id;
    
    // Validate ID
    validateId(id);
    
    const result = await accountService.deactivateAccount(id);
    res.json(result);
  } catch (err) {
    console.error("Error deactivating account:", err);
    
    // Handle validation errors
    if (err.message.includes("ID is required") || err.message.includes("Invalid ID format")) {
      return res.status(400).json({ error: err.message });
    }
    
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
    const id = req.params.id;
    
    // Validate ID
    validateId(id);
    
    const result = await accountService.reactivateAccount(id);
    res.json(result);
  } catch (err) {
    console.error("Error reactivating account:", err);
    
    // Handle validation errors
    if (err.message.includes("ID is required") || err.message.includes("Invalid ID format")) {
      return res.status(400).json({ error: err.message });
    }
    
    if (err.message === "Account not found") {
      return res.status(404).json({ error: err.message });
    }
    if (err.message === "Account is already active") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Failed to reactivate account" });
  }
}

// Delete account
async function deleteAccount(req, res) {
  try {
    const id = req.params.id;
    
    // Validate ID
    validateId(id);
    
    const result = await accountService.deleteAccount(id);
    res.json(result);
  } catch (err) {
    console.error("Error deleting account:", err);
    
    // Handle validation errors
    if (err.message.includes("ID is required") || err.message.includes("Invalid ID format")) {
      return res.status(400).json({ error: err.message });
    }
    
    if (err.message === "Account not found") {
      return res.status(404).json({ error: err.message });
    }
    if (err.message === "Account must be deactivated before permanent deletion") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Failed to delete account" });
  }
}

async function getActiveAccountsByUser(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const accounts = await accountService.getActiveAccountsByUser(userId);
    res.json(accounts);
  } catch (err) {
    console.error("Error getting active accounts by user:", err);
    res.status(500).json({ error: "Failed to get active accounts by user" });
  }
}


async function getActiveUnassignedAccounts(req, res) {
  try {
    const accounts = await accountService.getActiveUnassignedAccounts();
    res.json(accounts);
  } catch (err) {
    console.error("Error getting active unassigned accounts:", err);
    res.status(500).json({ error: "Failed to get active unassigned accounts" });
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