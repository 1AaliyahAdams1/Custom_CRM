const sql = require("mssql");
const dbConfig = require("../../dbConfig");

// =======================
// Customer Segmentation / Demographics Report
// =======================
async function getCustomerSegmentation(segmentType = null) {
  const pool = await sql.connect(dbConfig);
  const request = pool.request();
  if (segmentType) request.input("SegmentType", sql.NVarChar(100), segmentType);
  const result = await request.execute("GetCustomerSegmentation");
  return result.recordset;
}

module.exports = {
  getCustomerSegmentation,
};

//GetCustomerSegmentation