const dealService = require("../services/dealService");

// Validation helper functions
const validateDealData = (data) => {
  const errors = [];

  // Required fields validation
  if (!data.DealName || data.DealName.trim().length === 0) {
    errors.push("Deal Name is required");
  } else if (data.DealName.trim().length < 3) {
    errors.push("Deal Name must be at least 3 characters long");
  } else if (data.DealName.trim().length > 100) {
    errors.push("Deal Name must not exceed 100 characters");
  }

  if (!data.AccountID) {
    errors.push("Account ID is required");
  } else if (isNaN(parseInt(data.AccountID))) {
    errors.push("Account ID must be a valid number");
  }

  if (!data.DealStageID) {
    errors.push("Deal Stage ID is required");
  } else if (isNaN(parseInt(data.DealStageID))) {
    errors.push("Deal Stage ID must be a valid number");
  }

  // Value validation - required field
  if (data.Value === undefined || data.Value === null || data.Value === "") {
    errors.push("Value is required");
  } else if (isNaN(parseFloat(data.Value))) {
    errors.push("Value must be a valid number");
  } else if (parseFloat(data.Value) < 0) {
    errors.push("Value must be a positive number");
  }

  // Close Date validation - required field
  if (!data.CloseDate || data.CloseDate.trim() === "") {
    errors.push("Close Date is required");
  } else {
    const closeDate = new Date(data.CloseDate);
    if (isNaN(closeDate.getTime())) {
      errors.push("Close Date must be a valid date");
    } else {
      // Check if close date is not in the past (optional business rule)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (closeDate < today) {
        errors.push("Close Date cannot be in the past");
      }
    }
  }

  // Optional field validation
  if (
    data.Probability !== undefined &&
    data.Probability !== null &&
    data.Probability !== ""
  ) {
    const probability = parseFloat(data.Probability);
    if (isNaN(probability)) {
      errors.push("Probability must be a valid number");
    } else if (probability < 0 || probability > 100) {
      errors.push("Probability must be between 0 and 100");
    }
  }

  if (
    data.CurrencyID &&
    data.CurrencyID !== "" &&
    isNaN(parseInt(data.CurrencyID))
  ) {
    errors.push("Currency ID must be a valid number");
  }

  return errors;
};

const sanitizeDealData = (data) => {
  return {
    DealName: data.DealName ? data.DealName.trim() : "",
    AccountID: data.AccountID ? parseInt(data.AccountID) : null,
    DealStageID: data.DealStageID ? parseInt(data.DealStageID) : null,
    Value:
      data.Value !== undefined && data.Value !== null && data.Value !== ""
        ? parseFloat(data.Value)
        : null,
    Probability:
      data.Probability !== undefined &&
      data.Probability !== null &&
      data.Probability !== ""
        ? parseFloat(data.Probability)
        : null,
    CloseDate:
      data.CloseDate && data.CloseDate.trim() !== ""
        ? data.CloseDate.trim()
        : null,
    CurrencyID:
      data.CurrencyID && data.CurrencyID !== ""
        ? parseInt(data.CurrencyID)
        : null,
  };
};

const validateId = (id) => {
  const numId = parseInt(id);
  if (isNaN(numId) || numId <= 0) {
    return false;
  }
  return true;
};

async function getAllDeals(req, res) {
  try {
    // Handle onlyActive query parameter
    const onlyActive = req.query.onlyActive !== "false"; // Default to true
    const deals = await dealService.getAllDeals(onlyActive);

    res.json({
      success: true,
      data: deals,
      count: deals.length,
    });
  } catch (err) {
    console.error("Error getting all deals:", err);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve deals",
      message: "An error occurred while fetching deals. Please try again.",
    });
  }
}

async function getDealById(req, res) {
  try {
    // Validate ID parameter
    if (!validateId(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid deal ID",
        message: "Deal ID must be a valid positive number",
      });
    }

    const deal = await dealService.getDealById(req.params.id);

    if (!deal) {
      return res.status(404).json({
        success: false,
        error: "Deal not found",
        message: "The requested deal could not be found",
      });
    }

    res.json({
      success: true,
      data: deal,
    });
  } catch (err) {
    console.error("Error getting deal by ID:", err);

    if (err.message && err.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        error: "Deal not found",
        message: "The requested deal could not be found",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to retrieve deal",
      message: "An error occurred while fetching the deal. Please try again.",
    });
  }
}

async function createDeal(req, res) {
  // Inline validation for missing fields or wrong formats
  const errors = validateDealData(req.body);
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      message: errors,
    });
  }

  try {
    // Sanitize input data
    const sanitizedData = sanitizeDealData(req.body);

    const newDeal = await dealService.createDeal(sanitizedData);
    res.status(201).json({
      success: true,
      message: "Deal created successfully",
      data: newDeal,
    });
  } catch (err) {
    console.error("Error creating deal:", err);

    // Handle specific database errors
    if (err.message && err.message.includes("duplicate")) {
      return res.status(409).json({
        success: false,
        error: "Duplicate entry",
        message: "A deal with this information already exists",
      });
    }

    if (err.message && err.message.includes("foreign key")) {
      return res.status(400).json({
        success: false,
        error: "Invalid reference",
        message: "The specified Account or Deal Stage does not exist",
      });
    }

    if (err.message && err.message.includes("Required fields missing")) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        message: err.message,
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create deal",
      message: "An error occurred while creating the deal. Please try again.",
    });
  }
}

async function updateDeal(req, res) {
  // Inline validation for missing fields or wrong formats
  const errors = validateDealData(req.body);
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      message: errors,
    });
  }

  try {
    // Validate ID parameter
    if (!validateId(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid deal ID",
        message: "Deal ID must be a valid positive number",
      });
    }

    // Sanitize input data
    const sanitizedData = sanitizeDealData(req.body);

    const updated = await dealService.updateDeal(req.params.id, sanitizedData);

    res.json({
      success: true,
      message: "Deal updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error("Error updating deal:", err);

    // Handle specific errors
    if (err.message && err.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        error: "Deal not found",
        message: "The deal you are trying to update could not be found",
      });
    }

    if (err.message && err.message.includes("foreign key")) {
      return res.status(400).json({
        success: false,
        error: "Invalid reference",
        message: "The specified Account or Deal Stage does not exist",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to update deal",
      message: "An error occurred while updating the deal. Please try again.",
    });
  }
}

async function deactivateDeal(req, res) {
  try {
    // Validate ID parameter
    if (!validateId(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid deal ID",
        message: "Deal ID must be a valid positive number",
      });
    }

    const result = await dealService.deactivateDeal(req.params.id, req.body);

    res.json({
      success: true,
      message: "Deal deactivated successfully",
      data: result,
    });
  } catch (err) {
    console.error("Error deactivating deal:", err);

    if (err.message && err.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        error: "Deal not found",
        message: "The deal you are trying to deactivate could not be found",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to deactivate deal",
      message:
        "An error occurred while deactivating the deal. Please try again.",
    });
  }
}

async function reactivateDeal(req, res) {
  try {
    // Validate ID parameter
    if (!validateId(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid deal ID",
        message: "Deal ID must be a valid positive number",
      });
    }

    const result = await dealService.reactivateDeal(req.params.id, req.body);

    res.json({
      success: true,
      message: "Deal reactivated successfully",
      data: result,
    });
  } catch (err) {
    console.error("Error reactivating deal:", err);

    if (err.message && err.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        error: "Deal not found",
        message: "The deal you are trying to reactivate could not be found",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to reactivate deal",
      message:
        "An error occurred while reactivating the deal. Please try again.",
    });
  }
}

async function deleteDeal(req, res) {
  try {
    // Validate ID parameter
    if (!validateId(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid deal ID",
        message: "Deal ID must be a valid positive number",
      });
    }

    const result = await dealService.deleteDeal(req.params.id, req.body);

    res.json({
      success: true,
      message: "Deal deleted successfully",
      data: result,
    });
  } catch (err) {
    console.error("Error deleting deal:", err);

    if (err.message && err.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        error: "Deal not found",
        message: "The deal you are trying to delete could not be found",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to delete deal",
      message: "An error occurred while deleting the deal. Please try again.",
    });
  }
}

async function getDealsByUser(req, res) {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid user ID",
        message: "User ID must be a valid positive number",
      });
    }

    const deals = await dealService.getDealsByUser(userId);
    res.json({
      success: true,
      data: deals,
      count: deals.length,
    });
  } catch (err) {
    console.error("Error fetching deals by user:", err);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve user deals",
      message:
        "An error occurred while fetching deals for this user. Please try again.",
    });
  }
}

module.exports = {
  getAllDeals,
  getDealById,
  createDeal,
  updateDeal,
  deactivateDeal,
  reactivateDeal,
  deleteDeal,
  getDealsByUser,
};
