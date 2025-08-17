const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

// =======================
// Get all deals
// =======================
async function getAllDeals(onlyActive = true) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("OnlyActive", sql.Bit, onlyActive ? 1 : 0)
      .execute("GetDeal");
    return result.recordset;
  } catch (error) {
    console.error("Deal Repo Error [getAllDeals]:", error);
    throw error;
  }
}

// =======================
// Get deal details by ID
// =======================
async function getDealById(dealId) {
  try {
    if (!dealId) {
      throw new Error("Deal ID is required");
    }

    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("DealID", sql.Int, dealId)
      .execute("GetDealByID");

    if (!result.recordset.length) {
      throw new Error("Deal not found");
    }

    return result.recordset[0];
  } catch (error) {
    console.error("Deal Repo Error [getDealById]:", error);
    throw error;
  }
}

// =======================
// Create a new deal
// =======================
async function createDeal(data, changedBy = 1, actionTypeId = 1) {
  try {
    // Input validation
    if (!data || typeof data !== "object") {
      throw new Error("Deal data is required");
    }

    const {
      AccountID,
      DealStageID,
      DealName,
      Value,
      CloseDate,
      Probability = null,
      CurrencyID = null,
    } = data;

    // Validate required fields
    if (!AccountID || !DealStageID || !DealName || !Value || !CloseDate) {
      throw new Error(
        "Required fields missing: AccountID, DealStageID, DealName, Value, CloseDate"
      );
    }

    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("AccountID", sql.Int, AccountID)
      .input("DealStageID", sql.Int, DealStageID)
      .input("DealName", sql.VarChar(100), DealName)
      .input("Value", sql.Decimal(18, 2), Value)
      .input("CloseDate", sql.Date, CloseDate)
      .input("Probability", sql.Int, Probability)
      .input("CurrencyID", sql.Int, CurrencyID)
      .input("ChangedBy", sql.Int, changedBy)
      .input("ActionTypeID", sql.Int, actionTypeId)
      .execute("CreateDeal");

    return {
      DealID: result.recordset[0]?.DealID || null,
      message: "Deal created successfully",
    };
  } catch (error) {
    console.error("Deal Repo Error [createDeal]:", error);
    throw error;
  }
}

// =======================
// Update deal by ID
// =======================
async function updateDeal(dealId, data, changedBy = 1, actionTypeId = 2) {
  try {
    // Input validation
    if (!dealId) {
      throw new Error("Deal ID is required");
    }
    if (!data || typeof data !== "object") {
      throw new Error("Deal data is required");
    }

    const {
      AccountID,
      DealStageID,
      DealName,
      Value,
      CloseDate,
      Probability = null,
      CurrencyID = null,
    } = data;

    // Validate required fields
    if (!AccountID || !DealStageID || !DealName || !Value || !CloseDate) {
      throw new Error(
        "Required fields missing: AccountID, DealStageID, DealName, Value, CloseDate"
      );
    }

    const pool = await sql.connect(dbConfig);

    // Check if deal exists
    const existing = await pool
      .request()
      .input("DealID", sql.Int, dealId)
      .execute("GetDealByID");

    if (!existing.recordset.length) {
      throw new Error("Deal not found");
    }

    await pool
      .request()
      .input("DealID", sql.Int, dealId)
      .input("AccountID", sql.Int, AccountID)
      .input("DealStageID", sql.Int, DealStageID)
      .input("DealName", sql.VarChar(100), DealName)
      .input("Value", sql.Decimal(18, 2), Value)
      .input("CloseDate", sql.Date, CloseDate)
      .input("Probability", sql.Int, Probability)
      .input("CurrencyID", sql.Int, CurrencyID)
      .input("ChangedBy", sql.Int, changedBy)
      .input("ActionTypeID", sql.Int, actionTypeId) // 2 = Update
      .execute("UpdateDeal");

    return { message: "Deal updated successfully", DealID: dealId };
  } catch (error) {
    console.error("Deal Repo Error [updateDeal]:", error);
    throw error;
  }
}

// =======================
// Deactivate deal
// =======================
async function deactivateDeal(
  dealId,
  data = {},
  changedBy = 1,
  actionTypeId = 3
) {
  try {
    if (!dealId) {
      throw new Error("Deal ID is required");
    }

    const pool = await sql.connect(dbConfig);

    // Check if deal exists first
    const existing = await pool
      .request()
      .input("DealID", sql.Int, dealId)
      .execute("GetDealByID");

    if (!existing.recordset.length) {
      throw new Error("Deal not found");
    }

    // Use existing deal data for deactivation
    const existingDeal = existing.recordset[0];

    await pool
      .request()
      .input("DealID", sql.Int, dealId)
      .input("AccountID", sql.Int, existingDeal.AccountID)
      .input("DealStageID", sql.Int, existingDeal.DealStageID)
      .input("DealName", sql.VarChar(100), existingDeal.DealName)
      .input("Value", sql.Decimal(18, 2), existingDeal.Value)
      .input("CloseDate", sql.Date, existingDeal.CloseDate)
      .input("Probability", sql.Int, existingDeal.Probability)
      .input("CurrencyID", sql.Int, existingDeal.CurrencyID)
      .input("ChangedBy", sql.Int, changedBy)
      .input("ActionTypeID", sql.Int, actionTypeId)
      .execute("DeactivateDeal");

    return { message: "Deal deactivated successfully", DealID: dealId };
  } catch (error) {
    console.error("Deal Repo Error [deactivateDeal]:", error);
    throw error;
  }
}

// =======================
// Reactivate deal
// =======================
async function reactivateDeal(
  dealId,
  data = {},
  changedBy = 1,
  actionTypeId = 4
) {
  try {
    if (!dealId) {
      throw new Error("Deal ID is required");
    }

    const pool = await sql.connect(dbConfig);

    // Check if deal exists first
    const existing = await pool
      .request()
      .input("DealID", sql.Int, dealId)
      .execute("GetDealByID");

    if (!existing.recordset.length) {
      throw new Error("Deal not found");
    }

    // Use existing deal data for reactivation
    const existingDeal = existing.recordset[0];

    await pool
      .request()
      .input("DealID", sql.Int, dealId)
      .input("AccountID", sql.Int, existingDeal.AccountID)
      .input("DealStageID", sql.Int, existingDeal.DealStageID)
      .input("DealName", sql.VarChar(100), existingDeal.DealName)
      .input("Value", sql.Decimal(18, 2), existingDeal.Value)
      .input("CloseDate", sql.Date, existingDeal.CloseDate)
      .input("Probability", sql.Int, existingDeal.Probability)
      .input("CurrencyID", sql.Int, existingDeal.CurrencyID)
      .input("ChangedBy", sql.Int, changedBy)
      .input("ActionTypeID", sql.Int, actionTypeId)
      .execute("ReactivateDeal");

    return { message: "Deal reactivated successfully", DealID: dealId };
  } catch (error) {
    console.error("Deal Repo Error [reactivateDeal]:", error);
    throw error;
  }
}

// =======================
// Delete deal
// =======================
async function deleteDeal(dealId, data = {}, changedBy = 1, actionTypeId = 5) {
  try {
    if (!dealId) {
      throw new Error("Deal ID is required");
    }

    const pool = await sql.connect(dbConfig);

    // Check if deal exists first
    const existing = await pool
      .request()
      .input("DealID", sql.Int, dealId)
      .execute("GetDealByID");

    if (!existing.recordset.length) {
      throw new Error("Deal not found");
    }

    // Use existing deal data for deletion
    const existingDeal = existing.recordset[0];

    await pool
      .request()
      .input("DealID", sql.Int, dealId)
      .input("AccountID", sql.Int, existingDeal.AccountID)
      .input("DealStageID", sql.Int, existingDeal.DealStageID)
      .input("DealName", sql.VarChar(100), existingDeal.DealName)
      .input("Value", sql.Decimal(18, 2), existingDeal.Value)
      .input("CloseDate", sql.Date, existingDeal.CloseDate)
      .input("Probability", sql.Int, existingDeal.Probability)
      .input("CurrencyID", sql.Int, existingDeal.CurrencyID)
      .input("ChangedBy", sql.Int, changedBy)
      .input("ActionTypeID", sql.Int, actionTypeId)
      .execute("DeleteDeal");

    return { message: "Deal deleted successfully", DealID: dealId };
  } catch (error) {
    console.error("Deal Repo Error [deleteDeal]:", error);
    throw error;
  }
}

// =======================
// Get deals by user
// =======================
async function getDealsByUser(userId) {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const pool = await sql.connect(dbConfig);
    const result = await pool.request().input("UserID", sql.Int, userId).query(`
        SELECT
          d.[DealID],
          d.[AccountID],
          d.[DealStageID],
          d.[DealName],
          d.[Value],
          d.[CloseDate],
          d.[Probability],
          d.[CurrencyID],
          d.[CreatedAt],
          d.[UpdatedAt],
          d.[Active]
        FROM [CRM].[dbo].[Deal] d
        JOIN [CRM].[dbo].[AssignedUser] au ON d.AccountID = au.AccountID AND au.Active = 1
        JOIN [CRM].[dbo].[Account] a ON d.AccountID = a.AccountID AND a.Active = 1
        WHERE au.UserID = @UserID
          AND d.Active = 1;
      `);

    return result.recordset;
  } catch (error) {
    console.error("Deal Repo Error [getDealsByUser]:", error);
    throw error;
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
