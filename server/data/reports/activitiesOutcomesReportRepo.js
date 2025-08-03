// data/reports/activitiesOutcomesReportRepo.js
const sql = require("mssql");
const dbConfig = require("../../dbConfig");

// =======================
// Activities vs. Outcomes Report
// =======================
async function getActivitiesVsOutcomes() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().execute("GetActivitiesVsOutcomes");
  return result.recordset;
}

module.exports = {
  getActivitiesVsOutcomes,
};

