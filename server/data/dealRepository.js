const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

// =======================
// Audit log for TempDeal
// =======================
async function insertTempDealLog(pool, {
  DealID,
  AccountID = null,
  DealStageID = null,
  DealName = null,
  Value = null,
  CloseDate = null,
  ChangedBy = "System",
  ActionType = "UPDATE",
  UpdatedAt = new Date(),
}) {
  const includeCreatedAt = ActionType === "CREATE" || ActionType === "DELETE";

  const query = `
    INSERT INTO TempDeal (
      DealID, AccountID, DealStageID, DealName, Value, CloseDate,
      ChangedBy, ActionType, UpdatedAt${includeCreatedAt ? ', CreatedAt' : ''}
    ) VALUES (
      @DealID, @AccountID, @DealStageID, @DealName, @Value, @CloseDate,
      @ChangedBy, @ActionType, @UpdatedAt${includeCreatedAt ? ', GETDATE()' : ''}
    )
  `;

  await pool.request()
    .input("DealID", sql.Int, DealID)
    .input("AccountID", sql.Int, AccountID)
    .input("DealStageID", sql.Int, DealStageID)
    .input("DealName", sql.VarChar, DealName)
    .input("Value", sql.Decimal(18, 2), Value)
    .input("CloseDate", sql.Date, CloseDate)
    .input("ChangedBy", sql.VarChar, ChangedBy)
    .input("ActionType", sql.VarChar, ActionType)
    .input("UpdatedAt", sql.DateTime, UpdatedAt)
    .query(query);
}

// =======================
// Deal CRUD
// =======================
async function getAllDeals() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query("SELECT * FROM Deal");
    return result.recordset;
  } catch (error) {
    console.error("Error fetching deals:", error);
    throw error;
  }
}

async function createDeal(dealData, changedBy = "System") {
  try {
    const pool = await sql.connect(dbConfig);
    const { AccountID, DealStageID, DealName, Value, CloseDate } = dealData;

    const insertResult = await pool.request()
      .input("AccountID", sql.Int, AccountID)
      .input("DealStageID", sql.Int, DealStageID)
      .input("DealName", sql.VarChar, DealName)
      .input("Value", sql.Decimal(18, 2), Value)
      .input("CloseDate", sql.Date, CloseDate)
      .query(`
        INSERT INTO Deal (AccountID, DealStageID, DealName, Value, CloseDate, CreatedAt, UpdatedAt)
        VALUES (@AccountID, @DealStageID, @DealName, @Value, @CloseDate, GETDATE(), GETDATE());
        SELECT SCOPE_IDENTITY() AS DealID;
      `);

    const newDealID = insertResult.recordset[0].DealID;

    await insertTempDealLog(pool, {
      DealID: newDealID,
      AccountID,
      DealStageID,
      DealName,
      Value,
      CloseDate,
      ChangedBy: changedBy,
      ActionType: "CREATE"
    });

    return { DealID: newDealID };
  } catch (error) {
    console.error("Error creating deal:", error);
    throw error;
  }
}

async function updateDeal(id, dealData, changedBy = "System") {
  try {
    const pool = await sql.connect(dbConfig);

    const existingResult = await pool.request()
      .input("DealID", sql.Int, id)
      .query("SELECT * FROM Deal WHERE DealID = @DealID");

    if (existingResult.recordset.length === 0) {
      throw new Error("Deal not found");
    }
    const existing = existingResult.recordset[0];
    const { AccountID, DealStageID, DealName, Value, CloseDate } = dealData;

    await pool.request()
      .input("DealID", sql.Int, id)
      .input("AccountID", sql.Int, AccountID)
      .input("DealStageID", sql.Int, DealStageID)
      .input("DealName", sql.VarChar, DealName)
      .input("Value", sql.Decimal(18, 2), Value)
      .input("CloseDate", sql.Date, CloseDate)
      .query(`
        UPDATE Deal SET
          AccountID = @AccountID,
          DealStageID = @DealStageID,
          DealName = @DealName,
          Value = @Value,
          CloseDate = @CloseDate,
          UpdatedAt = GETDATE()
        WHERE DealID = @DealID
      `);

    const fieldsChanged = {
      AccountID: AccountID !== existing.AccountID ? AccountID : null,
      DealStageID: DealStageID !== existing.DealStageID ? DealStageID : null,
      DealName: DealName !== existing.DealName ? DealName : null,
      Value: Value !== existing.Value ? Value : null,
      CloseDate: CloseDate !== existing.CloseDate ? CloseDate : null,
    };

    await insertTempDealLog(pool, {
      DealID: id,
      ...fieldsChanged,
      ChangedBy: changedBy,  
      ActionType: "UPDATE"
    });

    return { message: "Deal updated", DealID: id };
  } catch (error) {
    console.error("Error updating deal:", error);
    throw error;
  }
}

async function deleteDeal(id, changedBy = "System") {
  try {
    const pool = await sql.connect(dbConfig);

    const existingResult = await pool.request()
      .input("DealID", sql.Int, id)
      .query("SELECT * FROM Deal WHERE DealID = @DealID");

    if (existingResult.recordset.length === 0) {
      throw new Error("Deal not found");
    }

    const deleted = existingResult.recordset[0];

    await pool.request()
      .input("DealID", sql.Int, id)
      .query("DELETE FROM Deal WHERE DealID = @DealID");

    await insertTempDealLog(pool, {
      DealID: deleted.DealID,
      AccountID: deleted.AccountID,
      DealStageID: deleted.DealStageID,
      DealName: deleted.DealName,
      Value: deleted.Value,
      CloseDate: deleted.CloseDate,
      ChangedBy: changedBy,
      ActionType: "DELETE"
    });

    return { message: "Deal deleted successfully", DealID: id };
  } catch (error) {
    console.error("Error deleting deal:", error);
    throw error;
  }
}

async function getDealDetails(dealId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("DealID", sql.Int, dealId)
      .query(`
        SELECT
          d.DealID,
          d.DealName,
          acc.AccountName AS Account,
          d.Value,
          ds.StageName,
          ds.Progression,
          p.ProductName,
          dp.PriceAtTime,
          d.CloseDate,
          d.CreatedAt,
          d.UpdatedAt
        FROM CRM.dbo.Deal d
        INNER JOIN CRM.dbo.DealStage ds ON d.DealStageID = ds.DealStageID
        INNER JOIN CRM.dbo.Account acc ON d.AccountID = acc.AccountID
        LEFT JOIN CRM.dbo.DealProduct dp ON d.DealID = dp.DealID
        LEFT JOIN CRM.dbo.Product p ON dp.ProductID = p.ProductID
        WHERE d.DealID = @DealID
        ORDER BY p.ProductName;
      `);
    return result.recordset;
  } catch (error) {
    console.error("Error fetching deal details:", error);
    throw error;
  }
}

// =======================
// Module Exports
// =======================
module.exports = {
  getAllDeals,
  createDeal,
  updateDeal,
  deleteDeal,
  getDealDetails,
};
