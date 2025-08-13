const { sql, poolPromise } = require("../../dbConfig");

// =======================
// Customer Segmentation / Demographics Report
// =======================
async function getCustomerSegmentation(segmentType = null) {
try {
    const pool = await poolPromise;
    const request = pool.request();
  
  if (segmentType) request.input("SegmentType", sql.NVarChar(100), segmentType);
  
  const result = await request.execute("GetCustomerSegmentation");
  return result.recordset;
  } catch (error) {
    console.error("Database error in getCustomerSegmentation:", error);
    throw error;
  }
}

module.exports = {
  getCustomerSegmentation,
};

//GetCustomerSegmentation