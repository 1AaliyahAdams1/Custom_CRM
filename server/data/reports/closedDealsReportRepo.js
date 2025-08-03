const sql = require("mssql");
const dbConfig = require("../../dbConfig");

// =======================
// Get Closed Deals Report
// =======================
async function getClosedDealsByPeriod(stageName = null, startDate = null, endDate = null) {
  const pool = await sql.connect(dbConfig);
  const request = pool.request();
  if (stageName) request.input("StageName", sql.VarChar(100), stageName);
  if (startDate) request.input("StartDate", sql.Date, startDate);
  if (endDate) request.input("EndDate", sql.Date, endDate);
  const result = await request.execute("GetClosedDealsRevenueByPeriod");
  return result.recordset;
}

// =======================
// Get Closed Deals by Customer/Account
// =======================
async function getClosedDealsByAccount(stageName = null, startDate = null, endDate = null) {
  const pool = await sql.connect(dbConfig);
  const request = pool.request();
  if (stageName) request.input("StageName", sql.NVarChar(255), stageName);
  if (startDate) request.input("StartDate", sql.Date, startDate);
  if (endDate) request.input("EndDate", sql.Date, endDate);
  const result = await request.execute("GetClosedDealsRevenueByAccount");
  return result.recordset;
}

// =======================
// Get Closed Deals by Role
// =======================
async function getClosedDealsByRole(stageName = null, roleName = null, startDate = null, endDate = null) {
  const pool = await sql.connect(dbConfig);
  const request = pool.request();
  if (stageName) request.input("StageName", sql.NVarChar(255), stageName);
  if (roleName) request.input("RoleName", sql.NVarChar(100), roleName);
  if (startDate) request.input("StartDate", sql.Date, startDate);
  if (endDate) request.input("EndDate", sql.Date, endDate);
  const result = await request.execute("GetClosedDealsByRole");
  return result.recordset;
}

// =======================
// Get Closed Deals by Team
// =======================
async function getClosedDealsByTeam(stageName = null, startDate = null, endDate = null) {
  const pool = await sql.connect(dbConfig);
  const request = pool.request();
  if (stageName) request.input("StageName", sql.NVarChar(255), stageName);
  if (startDate) request.input("StartDate", sql.Date, startDate);
  if (endDate) request.input("EndDate", sql.Date, endDate);
  const result = await request.execute("GetClosedDealsByTeam");
  return result.recordset;
}

// =======================
// Get Closed Deals by Product
// =======================
async function getClosedDealsByProduct(stageName = null, startDate = null, endDate = null) {
  const pool = await sql.connect(dbConfig);
  const request = pool.request();
  if (stageName) request.input("StageName", sql.NVarChar(255), stageName);
  if (startDate) request.input("StartDate", sql.Date, startDate);
  if (endDate) request.input("EndDate", sql.Date, endDate);
  const result = await request.execute("GetClosedDealsByProduct");
  return result.recordset;
}

module.exports = {
  getClosedDealsByPeriod,
  getClosedDealsByAccount,
  getClosedDealsByRole,
  getClosedDealsByTeam,
  getClosedDealsByProduct
};

