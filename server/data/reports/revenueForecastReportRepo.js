const { sql, poolPromise } = require("../../dbConfig");

// =======================
// Get Revenue Forecast Report
// =======================
async function getRevenueForecast(startDate = null, endDate = null, stageName = 'Closed Won') {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    
    if (startDate) request.input("StartDate", sql.Date, startDate);
    if (endDate) request.input("EndDate", sql.Date, endDate);
    if (stageName) request.input("StageName", sql.VarChar(100), stageName);
    
    const result = await request.execute("GetRevenueForecast");
    return result.recordset;
  } catch (error) {
    console.error("Database error in getRevenueForecast:", error);
    throw error;
  }
}

module.exports = {
  getRevenueForecast,
};

//GetRevenueForecast