const { sql, poolPromise } = require("../../dbConfig");

// =======================
// Get Sales Pipeline Report
// =======================
async function getSalesPipeline(startDate = null, endDate = null) {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    
    if (startDate) request.input("StartDate", sql.Date, startDate);
    if (endDate) request.input("EndDate", sql.Date, endDate);
    
    const result = await request.execute("GetSalesPipeline");
    return result.recordset;
  } catch (error) {
    console.error("Database error in getSalesPipeline:", error);
    throw error;
  }
}

module.exports = {
  getSalesPipeline,
};
//GetSalesPipeline