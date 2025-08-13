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
    console.error("DealStageRepo Error [getAllDealStages]:", error);
    throw error;
  }
}

//all stored procedures
//CreateDealStage
// GetDealStage
// GetDealStageByID
// UpdateDealStage
// DeactivateDealStage
// ReactivateDealStage
// DeleteDealStage

// =======================
// Get deal stage by ID
// =======================
async function getDealStageById(dealStageId) {
  if (!dealStageId) throw new Error("dealStageId is required");

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("DealStageID", sql.Int, dealStageId)
      .execute("GetDealStageByID");
    return result.recordset[0] || null;
  } catch (error) {
    console.error("DealStageRepo Error [getDealStageById]:", error);
    throw error;
  }
}

// =======================
// Create a new deal stage
// =======================
async function createDealStage({ StageName, Progression, Display_order }) {
  if (!StageName) throw new Error("StageName is required");
  if (Progression === undefined) throw new Error("Progression is required");
  if (Display_order === undefined) throw new Error("Display_order is required");

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("StageName", sql.VarChar(100), StageName)
      .input("Progression", sql.Decimal(5, 2), Progression)
      .input("Display_order", sql.Int, Display_order)
      .execute("CreateDealStage");
  } catch (error) {
    console.error("DealStageRepo Error [createDealStage]:", error);
    throw error;
  }
}

// =======================
// Update existing deal stage
// =======================
async function updateDealStage(dealStageId, { StageName, Progression, Display_order }) {
  if (!dealStageId) throw new Error("dealStageId is required");
  if (!StageName) throw new Error("StageName is required");
  if (Progression === undefined) throw new Error("Progression is required");
  if (Display_order === undefined) throw new Error("Display_order is required");

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("DealStageID", sql.Int, dealStageId)
      .input("StageName", sql.VarChar(100), StageName)
      .input("Progression", sql.Decimal(5, 2), Progression)
      .input("Display_order", sql.Int, Display_order)
      .execute("UpdateDealStage");
  } catch (error) {
    console.error("DealStageRepo Error [updateDealStage]:", error);
    throw error;
  }
}

// =======================
// Deactivate deal stage
// =======================
async function deactivateDealStage(dealStageId) {
  if (!dealStageId) throw new Error("dealStageId is required");

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("DealStageID", sql.Int, dealStageId)
      .execute("DeactivateDealStage");
  } catch (error) {
    console.error("DealStageRepo Error [deactivateDealStage]:", error);
    throw error;
  }
}

// =======================
// Reactivate deal stage
// =======================
async function reactivateDealStage(dealStageId) {
  if (!dealStageId) throw new Error("dealStageId is required");

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("DealStageID", sql.Int, dealStageId)
      .execute("ReactivateDealStage");
  } catch (error) {
    console.error("DealStageRepo Error [reactivateDealStage]:", error);
    throw error;
  }
}

// =======================
// Hard delete deal stage 
// =======================
async function deleteDealStage(dealStageId) {
  if (!dealStageId) throw new Error("dealStageId is required");

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("DealStageID", sql.Int, dealStageId)
      .execute("DeleteDealStage");
  } catch (error) {
    console.error("DealStageRepo Error [deleteDealStage]:", error);
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
};
