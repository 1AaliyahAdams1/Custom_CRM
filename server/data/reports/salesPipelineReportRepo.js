const sql = require("mssql");
const dbConfig = require("../dbConfig");

// =======================
// Get Sales Pipeline Report
// =======================
async function getSalesPipeline(startDate = null, endDate = null) {
  const pool = await sql.connect(dbConfig);
  const request = pool.request();
  if (startDate) request.input("StartDate", sql.Date, startDate);
  if (endDate) request.input("EndDate", sql.Date, endDate);
  const result = await request.execute("GetSalesPipeline");
  return result.recordset;
}

module.exports = {
  getSalesPipeline,
};

//GetSalesPipeline