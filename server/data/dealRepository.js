const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

// =======================
// Get all deals
// =======================
async function getAllDeals() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
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
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("DealID", sql.Int, dealId)
      .execute("GetDealByID");
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
    const {
      AccountID,
      DealStageID,
      DealName,
      Value,
      CloseDate,
      Probability = null,
      CurrencyID = null
    } = data;

    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
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

    return { DealID: result.recordset[0].DealID || null };
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
    const {
      AccountID,
      DealStageID,
      DealName,
      Value,
      CloseDate,
      Probability = null,
      CurrencyID = null
    } = data;

    const pool = await sql.connect(dbConfig);

    const existing = await pool.request()
      .input("DealID", sql.Int, dealId)
      .execute("GetDealByID");
    if (!existing.recordset.length) {
      throw new Error("Deal not found");
    }

    await pool.request()
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

    return { message: "Deal updated", DealID: dealId };
  } catch (error) {
    console.error("Deal Repo Error [updateDeal]:", error);
    throw error;
  }
}

// =======================
// Deactivate deal 
// =======================
async function deactivateDeal(dealId, data, changedBy = 1, actionTypeId = 3) {
  try {
    const {
      AccountID,
      DealStageID,
      DealName,
      Value,
      CloseDate,
      Probability = null,
      CurrencyID = null
    } = data;

    const pool = await sql.connect(dbConfig);

    await pool.request()
      .input("DealID", sql.Int, dealId)
      .input("AccountID", sql.Int, AccountID)
      .input("DealStageID", sql.Int, DealStageID)
      .input("DealName", sql.VarChar(100), DealName)
      .input("Value", sql.Decimal(18, 2), Value)
      .input("CloseDate", sql.Date, CloseDate)
      .input("Probability", sql.Int, Probability)
      .input("CurrencyID", sql.Int, CurrencyID)
      .input("ChangedBy", sql.Int, changedBy)
      .input("ActionTypeID", sql.Int, actionTypeId)
      .execute("DeactivateDeal");

    return { message: "Deal deactivated", DealID: dealId };
  } catch (error) {
    console.error("Deal Repo Error [deactivateDeal]:", error);
    throw error;
  }
}

// =======================
// Reactivate deal
// =======================
async function reactivateDeal(dealId, data, changedBy = 1, actionTypeId = 4) {
  try {
    const {
      AccountID,
      DealStageID,
      DealName,
      Value,
      CloseDate,
      Probability = null,
      CurrencyID = null
    } = data;

    const pool = await sql.connect(dbConfig);

    await pool.request()
      .input("DealID", sql.Int, dealId)
      .input("AccountID", sql.Int, AccountID)
      .input("DealStageID", sql.Int, DealStageID)
      .input("DealName", sql.VarChar(100), DealName)
      .input("Value", sql.Decimal(18, 2), Value)
      .input("CloseDate", sql.Date, CloseDate)
      .input("Probability", sql.Int, Probability)
      .input("CurrencyID", sql.Int, CurrencyID)
      .input("ChangedBy", sql.Int, changedBy)
      .input("ActionTypeID", sql.Int, actionTypeId)
      .execute("ReactivateDeal");

    return { message: "Deal reactivated", DealID: dealId };
  } catch (error) {
    console.error("Deal Repo Error [reactivateDeal]:", error);
    throw error;
  }
}

// =======================
// delete deal
// =======================
async function deleteDeal(dealId, data, changedBy = 1, actionTypeId = 5) {
  try {
    const {
      AccountID,
      DealStageID,
      DealName,
      Value,
      CloseDate,
      Probability = null,
      CurrencyID = null
    } = data;

    const pool = await sql.connect(dbConfig);

    await pool.request()
      .input("DealID", sql.Int, dealId)
      .input("AccountID", sql.Int, AccountID)
      .input("DealStageID", sql.Int, DealStageID)
      .input("DealName", sql.VarChar(100), DealName)
      .input("Value", sql.Decimal(18, 2), Value)
      .input("CloseDate", sql.Date, CloseDate)
      .input("Probability", sql.Int, Probability)
      .input("CurrencyID", sql.Int, CurrencyID)
      .input("ChangedBy", sql.Int, changedBy)
      .input("ActionTypeID", sql.Int, actionTypeId)
      .execute("DeleteDeal");

    return { message: "Deal deleted", DealID: dealId };
  } catch (error) {
    console.error("Deal Repo Error [deleteDeal]:", error);
    throw error;
  }
}

async function getDealsByUser(userId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("UserID", sql.Int, userId)
      .query(`
SELECT
    d.[DealID],
    d.[DealName],
    d.[AccountID],
    a.[AccountName],              
    d.[DealStageID],
    ds.[StageName],            
    d.[Value],
    c.[Symbol],               
    c.LocalName,
    c.[Prefix],                    
    d.[CloseDate],
    d.[Probability] AS Progression,
    d.[CreatedAt],
    d.[UpdatedAt],
    d.[Active]
FROM [8589_CRM].[dbo].[Deal] d
JOIN [8589_CRM].[dbo].[AssignedUser] au 
    ON d.AccountID = au.AccountID AND au.Active = 1
JOIN [8589_CRM].[dbo].[Account] a 
    ON d.AccountID = a.AccountID AND a.Active = 1
LEFT JOIN [8589_CRM].[dbo].[DealStage] ds 
    ON d.DealStageID = ds.DealStageID
LEFT JOIN [8589_CRM].[dbo].[Currency] c 
    ON d.CurrencyID = c.CurrencyID
WHERE au.UserID = @UserID
  AND d.Active = 1;

      `);

    return result.recordset;
  } catch (error) {
    console.error("Error fetching deals for user accounts:", error);
    throw error;
  }
}
// =======================
// Get deals by Account ID
// =======================
async function getDealsByAccountID(accountId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("AccountID", sql.Int, accountId)
      .query(`
        SELECT
            d.[DealID],
            d.[DealName],
            d.[AccountID],
            a.[AccountName],              
            d.[DealStageID],
            ds.[StageName],            
            d.[Value],
            c.[Symbol],               
            c.[LocalName],
            c.[Prefix],                    
            d.[CloseDate],
            d.[Probability] AS Progression,
            d.[CreatedAt],
            d.[UpdatedAt],
            d.[Active]
        FROM [8589_CRM].[dbo].[Deal] d
        JOIN [8589_CRM].[dbo].[Account] a 
            ON d.AccountID = a.AccountID AND a.Active = 1
        LEFT JOIN [8589_CRM].[dbo].[DealStage] ds 
            ON d.DealStageID = ds.DealStageID
        LEFT JOIN [8589_CRM].[dbo].[Currency] c 
            ON d.CurrencyID = c.CurrencyID
        WHERE d.AccountID = @AccountID
          AND d.Active = 1
        ORDER BY d.CreatedAt DESC;
      `);

    return result.recordset;
  } catch (error) {
    console.error("Deal Repo Error [getDealsByAccountID]:", error);
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
  getDealsByAccountID
};