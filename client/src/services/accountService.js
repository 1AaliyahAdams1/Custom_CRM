const accountService = require("../services/accountService");

// Validation helper functions
function validateId(id) {
  if (!id) {
    throw new Error("ID is required");
  }
  
  if (isNaN(id) && !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id)) {
    throw new Error("Invalid ID format");
  }
  
  return true;
}

function validateAccountData(data, isUpdate = false) {
  const errors = [];
  
  // AccountName validation
  if (!isUpdate || data.AccountName !== undefined) {
    if (!data.AccountName || typeof data.AccountName !== 'string') {
      errors.push("Account name is required and must be a string");
    } else if (data.AccountName.trim().length < 2 || data.AccountName.trim().length > 100) {
      errors.push("Account name must be between 2 and 100 characters");
    }
  }
  
  // Email validation
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
  
  // PrimaryPhone validation
  if (data.PrimaryPhone && typeof data.PrimaryPhone === 'string') {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(data.PrimaryPhone.replace(/[\s\-\(\)]/g, ''))) {
      errors.push("Invalid primary phone format");
    }
  }

  // Fax validation
  if (data.fax && typeof data.fax === 'string') {
    const faxRegex = /^[\+]?[1-9][\d\s\-\(\)]{7,20}$/;
    if (!faxRegex.test(data.fax.replace(/[\s\-\(\)]/g, ''))) {
      errors.push("Invalid fax format");
    }
  }

  // Website validation
  if (data.Website && typeof data.Website === 'string') {
    const urlRegex = /^https?:\/\/.+\..+/;
    if (!urlRegex.test(data.Website)) {
      errors.push("Invalid website URL format");
    }
  }

  // Postal code validation
  if (data.postal_code && typeof data.postal_code === 'string') {
    if (data.postal_code.trim().length > 20) {
      errors.push("Postal code must be 20 characters or less");
    }
  }
  
  // Address fields validation
  const addressFields = ['street_address1', 'street_address2', 'street_address3'];
  addressFields.forEach(field => {
    if (data[field] && typeof data[field] !== 'string') {
      errors.push(`${field.replace('_', ' ')} must be a string`);
    } else if (data[field] && data[field].trim().length > 255) {
      errors.push(`${field.replace('_', ' ')} must be 255 characters or less`);
    }
  });

  // Numeric fields validation
  const numericFields = {
    'number_of_employees': 'Number of employees',
    'number_of_venues': 'Number of venues',
    'number_of_releases': 'Number of releases',
    'number_of_events_anually': 'Number of events annually'
  };
  
  Object.entries(numericFields).forEach(([field, label]) => {
    if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
      const num = parseInt(data[field]);
      if (isNaN(num) || num < 0) {
        errors.push(`${label} must be a non-negative number`);
      } else if (num > 1000000) {
        errors.push(`${label} must be less than 1,000,000`);
      }
    }
  });
  
  // Annual revenue validation
  if (data.annual_revenue !== undefined && data.annual_revenue !== null && data.annual_revenue !== '') {
    const revenue = parseFloat(data.annual_revenue);
    if (isNaN(revenue) || revenue < 0) {
      errors.push("Annual revenue must be a non-negative number");
    } else if (revenue > 999999999999) {
      errors.push("Annual revenue must be less than 1 trillion");
    }
  }
  
  // ID dropdown fields validation
  const idFields = ['CityID', 'CountryID', 'StateProvinceID', 'IndustryID'];
  idFields.forEach(field => {
    if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
      const id = parseInt(data[field]);
      if (isNaN(id) || id <= 0) {
        errors.push(`${field.replace('ID', '')} must be a valid selection`);
      }
    }
  });
  
  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join('; ')}`);
  }
  
  return true;
}

function sanitizeInput(data) {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = value.trim();
    } else {
      sanitized[key] = value;
    }
  }

  const numericFields = [
    'number_of_employees', 'number_of_venues', 'number_of_releases', 'number_of_events_anually'
  ];
  
  numericFields.forEach(field => {
    if (sanitized[field] === '' || sanitized[field] === null) {
      sanitized[field] = null;
    } else if (sanitized[field] !== undefined) {
      sanitized[field] = parseInt(sanitized[field]) || null;
    }
  });

  if (sanitized.annual_revenue === '' || sanitized.annual_revenue === null) {
    sanitized.annual_revenue = null;
  } else if (sanitized.annual_revenue !== undefined) {
    sanitized.annual_revenue = parseFloat(sanitized.annual_revenue) || null;
  }

  const idFields = ['CityID', 'CountryID', 'StateProvinceID', 'IndustryID'];
  idFields.forEach(field => {
    if (sanitized[field] === '' || sanitized[field] === null) {
      sanitized[field] = null;
    } else if (sanitized[field] !== undefined) {
      sanitized[field] = parseInt(sanitized[field]) || null;
    }
  });
  
  return sanitized;
}



// controller functions 
module.exports = {
  getAllAccounts: async function(req, res) {
    try {
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
  },

  getAccountById: async function(req, res) {
    try {
      const id = req.params.id;
      validateId(id);
      const account = await accountService.getAccountById(id);
      if (!account) return res.status(404).json({ error: "Account not found" });
      res.json(account);
    } catch (err) {
      console.error("Error getting account by ID:", err);
      if (err.message.includes("ID is required") || err.message.includes("Invalid ID format")) {
        return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ error: "Failed to get account" });
    }
  },

  createAccount: async function(req, res) {
    try {
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: "Request body is required" });
      }
      validateAccountData(req.body, false);
      const sanitizedData = sanitizeInput(req.body);
      const newAccount = await accountService.createAccount(sanitizedData);
      res.status(201).json(newAccount);
    } catch (err) {
      console.error("Error creating account:", err);
      if (err.message.includes("Validation errors")) {
        return res.status(400).json({ error: err.message });
      }
      if (err.message.includes("already exists") || err.message.includes("duplicate")) {
        return res.status(409).json({ error: err.message });
      }
      res.status(500).json({ error: "Failed to create account" });
    }
  },

  updateAccount: async function(req, res) {
    try {
      const id = req.params.id;
      validateId(id);
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: "Request body is required" });
      }
      validateAccountData(req.body, true);
      const sanitizedData = sanitizeInput(req.body);
      const updated = await accountService.updateAccount(id, sanitizedData);
      if (!updated) return res.status(404).json({ error: "Account not found" });
      res.json(updated);
    } catch (err) {
      console.error("Error updating account:", err);
      if (
        err.message.includes("ID is required") ||
        err.message.includes("Invalid ID format") ||
        err.message.includes("Validation errors")
      ) {
        return res.status(400).json({ error: err.message });
      }
      if (err.message.includes("already exists") || err.message.includes("duplicate")) {
        return res.status(409).json({ error: err.message });
      }
      res.status(500).json({ error: "Failed to update account" });
    }
  },

  deactivateAccount: async function(req, res) {
    try {
      const id = req.params.id;
      validateId(id);
      const result = await accountService.deactivateAccount(id);
      res.json(result);
    } catch (err) {
      console.error("Error deactivating account:", err);
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
  },

  reactivateAccount: async function(req, res) {
    try {
      const id = req.params.id;
      validateId(id);
      const result = await accountService.reactivateAccount(id);
      res.json(result);
    } catch (err) {
      console.error("Error reactivating account:", err);
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
  },

  deleteAccount: async function(req, res) {
    try {
      const id = req.params.id;
      validateId(id);
      const result = await accountService.deleteAccount(id);
      res.json(result);
    } catch (err) {
      console.error("Error deleting account:", err);
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
  },
};
