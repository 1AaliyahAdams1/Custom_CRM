const { poolPromise } = require("../dbConfig");

// =======================
//Get All Deal Stages Query
// =======================
async function getAllDealStages() {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT DealStageID, StageName, Progression, Display_order
      FROM DealStage
      ORDER BY Progression
    `);
    return result.recordset;
  } catch (error) {
    console.error("DB error in getAllDealStages:", error);
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
// Exports
// =======================
module.exports = {
  getAllDealStages,
};
