const sql = require("mssql");
const dbConfig = require("../dbConfig");

// =======================
// Get Revenue Forecast Report
// =======================
async function getRevenueForecast(startDate = null, endDate = null, stageName = null) {
  const pool = await sql.connect(dbConfig);
  const request = pool.request();
  if (startDate) request.input("StartDate", sql.Date, startDate);
  if (endDate) request.input("EndDate", sql.Date, endDate);
  if (stageName) request.input("StageName", sql.VarChar(100), stageName);
  const result = await request.execute("GetRevenueForecast");
  return result.recordset;
}

module.exports = {
  getRevenueForecast,
};

//GetRevenueForecast