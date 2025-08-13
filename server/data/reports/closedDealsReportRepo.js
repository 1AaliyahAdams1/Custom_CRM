const { sql, poolPromise } = require("../../dbConfig");

// =======================
// Get Closed Deals Report
// =======================
async function getClosedDealsByPeriod(stageName = null, startDate = null, endDate = null) {
try {
    const pool = await poolPromise;
    const request = pool.request();
    
    if (stageName) request.input("StageName", sql.VarChar(100), stageName);
    if (startDate) request.input("StartDate", sql.Date, startDate);
    if (endDate) request.input("EndDate", sql.Date, endDate);
    
    const result = await request.execute("GetClosedDealsRevenueByPeriod");
    return result.recordset;
  } catch (error) {
    console.error("Database error in getClosedDealsByPeriod:", error);
    throw error;
  }
}

// =======================
// Get Closed Deals by Customer/Account
// =======================
async function getClosedDealsByAccount(stageName = null, startDate = null, endDate = null) {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    
    if (stageName) request.input("StageName", sql.NVarChar(255), stageName);
    if (startDate) request.input("StartDate", sql.Date, startDate);
    if (endDate) request.input("EndDate", sql.Date, endDate);
    
    const result = await request.execute("GetClosedDealsRevenueByAccount");
    return result.recordset;
  } catch (error) {
    console.error("Database error in getClosedDealsByAccount:", error);
    throw error;
  }
}

// =======================
// Get Closed Deals by Role
// =======================
async function getClosedDealsByRole(stageName = null, roleName = null, startDate = null, endDate = null) {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    
    if (stageName) request.input("StageName", sql.NVarChar(255), stageName);
    if (roleName) request.input("RoleName", sql.NVarChar(100), roleName);
    if (startDate) request.input("StartDate", sql.Date, startDate);
    if (endDate) request.input("EndDate", sql.Date, endDate);
    
    const result = await request.execute("GetClosedDealsByRole");
    return result.recordset;
  } catch (error) {
    console.error("Database error in getClosedDealsByRole:", error);
    throw error;
  }
}

// =======================
// Get Closed Deals by Team
// =======================
async function getClosedDealsByTeam(stageName = null, startDate = null, endDate = null) {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    
    if (stageName) request.input("StageName", sql.NVarChar(255), stageName);
    if (startDate) request.input("StartDate", sql.Date, startDate);
    if (endDate) request.input("EndDate", sql.Date, endDate);
    
    const result = await request.execute("GetClosedDealsByTeam");
    return result.recordset;
  } catch (error) {
    console.error("Database error in getClosedDealsByTeam:", error);
    throw error;
  }
}

// =======================
// Get Closed Deals by Product
// =======================
async function getClosedDealsByProduct(stageName = null, startDate = null, endDate = null) {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    
    if (stageName) request.input("StageName", sql.NVarChar(255), stageName);
    if (startDate) request.input("StartDate", sql.Date, startDate);
    if (endDate) request.input("EndDate", sql.Date, endDate);
    
    const result = await request.execute("GetClosedDealsByProduct");
    return result.recordset;
  } catch (error) {
    console.error("Database error in getClosedDealsByProduct:", error);
    throw error;
  }
}

module.exports = {
  getClosedDealsByPeriod,
  getClosedDealsByAccount,
  getClosedDealsByRole,
  getClosedDealsByTeam,
  getClosedDealsByProduct
};

