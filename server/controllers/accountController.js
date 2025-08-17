// controllers/accountController.js
const { body, validationResult } = require("express-validator");
const accountService = require("../services/accountService"); // adjust path if needed

// ---------------------- Validation Rules ----------------------
const validateAccount = [
  body("AccountName")
    .trim()
    .notEmpty()
    .withMessage("Account name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Account name must be between 2 and 100 characters"),

  body("email")
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage("Invalid email format"),

  body("PrimaryPhone")
    .optional({ checkFalsy: true })
    .matches(/^[\+]?[0-9]{7,20}$/)
    .withMessage("Invalid phone format"),

  body("fax")
    .optional({ checkFalsy: true })
    .matches(/^[\+]?[0-9]{7,20}$/)
    .withMessage("Invalid fax format"),

  body("Website")
    .optional({ checkFalsy: true })
    .matches(/^https?:\/\/.+\..+/)
    .withMessage("Website must start with http:// or https://"),

  body("postal_code")
    .optional({ checkFalsy: true })
    .isLength({ max: 20 })
    .withMessage("Postal code must be 20 characters or less"),

  body("street_address1")
    .optional({ checkFalsy: true })
    .isLength({ max: 255 })
    .withMessage("Address must be 255 characters or less"),

  body("street_address2")
    .optional({ checkFalsy: true })
    .isLength({ max: 255 })
    .withMessage("Address must be 255 characters or less"),

  body("street_address3")
    .optional({ checkFalsy: true })
    .isLength({ max: 255 })
    .withMessage("Address must be 255 characters or less"),

  body("number_of_employees")
    .optional({ checkFalsy: true })
    .isInt({ min: 0, max: 1000000 })
    .withMessage("Number of employees must be between 0 and 1,000,000"),

  body("number_of_venues")
    .optional({ checkFalsy: true })
    .isInt({ min: 0, max: 1000000 })
    .withMessage("Number of venues must be between 0 and 1,000,000"),

  body("number_of_releases")
    .optional({ checkFalsy: true })
    .isInt({ min: 0, max: 1000000 })
    .withMessage("Number of releases must be between 0 and 1,000,000"),

  body("number_of_events_anually")
    .optional({ checkFalsy: true })
    .isInt({ min: 0, max: 1000000 })
    .withMessage("Number of events must be between 0 and 1,000,000"),

  body("annual_revenue")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0, max: 999999999999 })
    .withMessage("Annual revenue must be less than 1 trillion"),
];

// ---------------------- Controllers ----------------------

// Get all accounts
async function getAllAccounts(req, res) {
  try {
    const accounts = await accountService.getAllAccounts();
    res.status(200).json({ success: true, data: accounts });
  } catch (error) {
    console.error("Error getting all accounts:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve accounts",
      message: error.message || "Internal Server Error",
    });
  }
}

// Get account details
async function getAccountDetails(req, res) {
  try {
    const { id } = req.params;
    if (!id || isNaN(parseInt(id, 10))) {
      return res.status(400).json({
        success: false,
        error: "Valid ID is required",
      });
    }

    const account = await accountService.getAccountDetails(id);
    if (!account) {
      return res.status(404).json({
        success: false,
        error: "Account not found",
      });
    }
    res.status(200).json({ success: true, data: account });
  } catch (error) {
    console.error("Error getting account details:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve account details",
      message: error.message || "Internal Server Error",
    });
  }
}

// Create account
async function createAccount(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      message: errors.array(),
    });
  }

  try {
    const newAccount = await accountService.createAccount(req.body);
    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: newAccount,
    });
  } catch (error) {
    console.error("Error creating account:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create account",
      message: error.message || "Internal Server Error",
    });
  }
}

// Update account
async function updateAccount(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      message: errors.array(),
    });
  }

  try {
    const { id } = req.params;
    if (!id || isNaN(parseInt(id, 10))) {
      return res.status(400).json({
        success: false,
        error: "Valid ID is required",
      });
    }

    const updatedAccount = await accountService.updateAccount(id, req.body);
    if (!updatedAccount) {
      return res.status(404).json({
        success: false,
        error: "Account not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Account updated successfully",
      data: updatedAccount,
    });
  } catch (error) {
    console.error("Error updating account:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update account",
      message: error.message || "Internal Server Error",
    });
  }
}

// Deactivate account
async function deactivateAccount(req, res) {
  try {
    const { id } = req.params;
    if (!id || isNaN(parseInt(id, 10))) {
      return res.status(400).json({
        success: false,
        error: "Valid ID is required",
      });
    }

    await accountService.deactivateAccount(id);
    res.status(200).json({
      success: true,
      message: "Account deactivated successfully",
    });
  } catch (error) {
    console.error("Error deactivating account:", error);
    res.status(500).json({
      success: false,
      error: "Failed to deactivate account",
      message: error.message || "Internal Server Error",
    });
  }
}

// Reactivate account
async function reactivateAccount(req, res) {
  try {
    const { id } = req.params;
    if (!id || isNaN(parseInt(id, 10))) {
      return res.status(400).json({
        success: false,
        error: "Valid ID is required",
      });
    }

    await accountService.reactivateAccount(id);
    res.status(200).json({
      success: true,
      message: "Account reactivated successfully",
    });
  } catch (error) {
    console.error("Error reactivating account:", error);
    res.status(500).json({
      success: false,
      error: "Failed to reactivate account",
      message: error.message || "Internal Server Error",
    });
  }
}

// Delete account
async function deleteAccount(req, res) {
  try {
    const { id } = req.params;
    if (!id || isNaN(parseInt(id, 10))) {
      return res.status(400).json({
        success: false,
        error: "Valid ID is required",
      });
    }

    await accountService.deleteAccount(id);
    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete account",
      message: error.message || "Internal Server Error",
    });
  }
}

// Get active accounts by user
async function getActiveAccountsByUser(req, res) {
  try {
    const { userId } = req.params;
    if (!userId || isNaN(parseInt(userId, 10))) {
      return res.status(400).json({
        success: false,
        error: "Valid User ID is required",
      });
    }

    const accounts = await accountService.getActiveAccountsByUser(userId);
    res.status(200).json({ success: true, data: accounts });
  } catch (error) {
    console.error("Error getting active accounts by user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve active accounts by user",
      message: error.message || "Internal Server Error",
    });
  }
}

// Get active unassigned accounts
async function getActiveUnassignedAccounts(req, res) {
  try {
    const accounts = await accountService.getActiveUnassignedAccounts();
    res.status(200).json({ success: true, data: accounts });
  } catch (error) {
    console.error("Error getting active unassigned accounts:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve active unassigned accounts",
      message: error.message || "Internal Server Error",
    });
  }
}

module.exports = {
  validateAccount, // export validation middleware
  getAllAccounts,
  getAccountDetails,
  createAccount,
  updateAccount,
  deactivateAccount,
  reactivateAccount,
  deleteAccount,
  getActiveAccountsByUser,
  getActiveUnassignedAccounts,
};
