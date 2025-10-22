const { sql, poolPromise } = require("../../dbConfig");

// =======================
// Activities vs. Outcomes Report
// =======================
async function getActivitiesVsOutcomes() {
try {
    const pool = await poolPromise;
    
    const result = await pool.request().execute("GetActivitiesVsOutcomes");
    return result.recordset;
} catch (error) {
    console.error("Database error in getActivitiesVsOutcomes:", error);
    throw error;
  }
}

module.exports = {
  getActivitiesVsOutcomes,
};

