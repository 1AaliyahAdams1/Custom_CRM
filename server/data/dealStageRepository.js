const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

// =======================
// Get all deal stages
// =======================
async function getAllDealStages() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().execute("GetDealStage");
    return result.recordset;
  } catch (error) {
    console.error("DealStage Repo Error [getAllDealStages]:", error);
    throw error;
  }
}

// =======================
// Get deal stage by ID
// =======================
async function getDealStageById(dealStageId) {
  if (!dealStageId) throw new Error("DealStage ID is required");

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("DealStageID", sql.Int, dealStageId)
      .execute("GetDealStageByID");

    if (!result.recordset.length) {
      throw new Error("DealStage not found");
    }

    return result.recordset[0];
  } catch (error) {
    console.error("DealStage Repo Error [getDealStageById]:", error);
    throw error;
  }
}

// =======================
// Create a new deal stage
// =======================
async function createDealStage({ StageName, Progression, Display_order }) {
  if (!StageName) throw new Error("Stage Name is required");
  if (Progression === undefined || Progression === null)
    throw new Error("Progression is required");
  if (Display_order === undefined || Display_order === null)
    throw new Error("Display Order is required");

  // Validate data types and ranges
  if (typeof Progression !== "number" || Progression < 0 || Progression > 100) {
    throw new Error("Progression must be a number between 0 and 100");
  }
  if (typeof Display_order !== "number" || Display_order < 0) {
    throw new Error("Display Order must be a positive number");
  }

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("StageName", sql.VarChar(100), StageName)
      .input("Progression", sql.Decimal(5, 2), Progression)
      .input("Display_order", sql.Int, Display_order)
      .execute("CreateDealStage");

    return {
      message: "DealStage created successfully",
      DealStageID: result.recordset[0]?.DealStageID || null,
    };
  } catch (error) {
    console.error("DealStage Repo Error [createDealStage]:", error);
    throw error;
  }
}

// =======================
// Update existing deal stage
// =======================
async function updateDealStage(
  dealStageId,
  { StageName, Progression, Display_order }
) {
  if (!dealStageId) throw new Error("DealStage ID is required");
  if (!StageName) throw new Error("Stage Name is required");
  if (Progression === undefined || Progression === null)
    throw new Error("Progression is required");
  if (Display_order === undefined || Display_order === null)
    throw new Error("Display Order is required");

  // Validate data types and ranges
  if (typeof Progression !== "number" || Progression < 0 || Progression > 100) {
    throw new Error("Progression must be a number between 0 and 100");
  }
  if (typeof Display_order !== "number" || Display_order < 0) {
    throw new Error("Display Order must be a positive number");
  }

  try {
    const pool = await sql.connect(dbConfig);

    // Check if deal stage exists
    const existing = await pool
      .request()
      .input("DealStageID", sql.Int, dealStageId)
      .execute("GetDealStageByID");

    if (!existing.recordset.length) {
      throw new Error("DealStage not found");
    }

    await pool
      .request()
      .input("DealStageID", sql.Int, dealStageId)
      .input("StageName", sql.VarChar(100), StageName)
      .input("Progression", sql.Decimal(5, 2), Progression)
      .input("Display_order", sql.Int, Display_order)
      .execute("UpdateDealStage");

    return {
      message: "DealStage updated successfully",
      DealStageID: dealStageId,
    };
  } catch (error) {
    console.error("DealStage Repo Error [updateDealStage]:", error);
    throw error;
  }
}

// =======================
// Deactivate deal stage
// =======================
async function deactivateDealStage(dealStageId) {
  if (!dealStageId) throw new Error("DealStage ID is required");

  try {
    const pool = await sql.connect(dbConfig);

    // Check if deal stage exists
    const existing = await pool
      .request()
      .input("DealStageID", sql.Int, dealStageId)
      .execute("GetDealStageByID");

    if (!existing.recordset.length) {
      throw new Error("DealStage not found");
    }

    await pool
      .request()
      .input("DealStageID", sql.Int, dealStageId)
      .execute("DeactivateDealStage");

    return {
      message: "DealStage deactivated successfully",
      DealStageID: dealStageId,
    };
  } catch (error) {
    console.error("DealStage Repo Error [deactivateDealStage]:", error);
    throw error;
  }
}

// =======================
// Reactivate deal stage
// =======================
async function reactivateDealStage(dealStageId) {
  if (!dealStageId) throw new Error("DealStage ID is required");

  try {
    const pool = await sql.connect(dbConfig);

    // Check if deal stage exists
    const existing = await pool
      .request()
      .input("DealStageID", sql.Int, dealStageId)
      .execute("GetDealStageByID");

    if (!existing.recordset.length) {
      throw new Error("DealStage not found");
    }

    await pool
      .request()
      .input("DealStageID", sql.Int, dealStageId)
      .execute("ReactivateDealStage");

    return {
      message: "DealStage reactivated successfully",
      DealStageID: dealStageId,
    };
  } catch (error) {
    console.error("DealStage Repo Error [reactivateDealStage]:", error);
    throw error;
  }
}

// =======================
// Hard delete deal stage
// =======================
async function deleteDealStage(dealStageId) {
  if (!dealStageId) throw new Error("DealStage ID is required");

  try {
    const pool = await sql.connect(dbConfig);

    // Check if deal stage exists
    const existing = await pool
      .request()
      .input("DealStageID", sql.Int, dealStageId)
      .execute("GetDealStageByID");

    if (!existing.recordset.length) {
      throw new Error("DealStage not found");
    }

    await pool
      .request()
      .input("DealStageID", sql.Int, dealStageId)
      .execute("DeleteDealStage");

    return {
      message: "DealStage deleted successfully",
      DealStageID: dealStageId,
    };
  } catch (error) {
    console.error("DealStage Repo Error [deleteDealStage]:", error);
    throw error;
  }
}

// =======================
// Get deal stages ordered by display order
// =======================
async function getDealStagesOrdered() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
        SELECT * FROM DealStage 
        WHERE Active = 1 
        ORDER BY Display_order ASC
      `);
    return result.recordset;
  } catch (error) {
    console.error("DealStage Repo Error [getDealStagesOrdered]:", error);
    throw error;
  }
}

module.exports = {
  getAllDealStages,
  getDealStageById,
  createDealStage,
  updateDealStage,
  deactivateDealStage,
  reactivateDealStage,
  deleteDealStage,
  getDealStagesOrdered,
};
