const { poolPromise } = require("../dbConfig");

//Get All Deal Stages Query
async function getAllDealStages() {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT DealStageID, StageName, Progression
      FROM DealStage
      ORDER BY Progression
    `);
    return result.recordset;
  } catch (error) {
    console.error("DB error in getAllDealStages:", error);
    throw error;
  }
}

module.exports = {
  getAllDealStages,
};
