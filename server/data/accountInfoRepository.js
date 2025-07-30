const sql = require("mssql");
const dbConfig = require("../dbConfig");

// =======================
// Get all AccountInfo entries
// Calls stored procedure: GetAccountInfo
// =======================
async function getAllAccountInfo() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .execute("GetAccountInfo");
  return result.recordset;
}

// =======================
// Get AccountInfo by AIID (primary key)
// Calls stored procedure: GetAccountInfoByID
// =======================
async function getAccountInfoById(aiid) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("AIID", sql.Int, aiid)
    .execute("GetAccountInfoByID");
  return result.recordset[0]; // single record
}

// =======================
// Create AccountInfo entry
// Calls stored procedure: CreateAccountInfo
// =======================
async function createAccountInfo(data) {
  const {
    AccountID, VenueTypeID, EntCityID,
    isVenueCompany, isEventCompany, isRecordLabel
  } = data;

  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("AccountID", sql.Int, AccountID)
    .input("VenueTypeID", sql.Int, VenueTypeID)
    .input("EntCityID", sql.Int, EntCityID)
    .input("isVenueCompany", sql.Bit, isVenueCompany)
    .input("isEventCompany", sql.Bit, isEventCompany)
    .input("isRecordLabel", sql.Bit, isRecordLabel)
    .execute("CreateAccountInfo");
}

// =======================
// Update AccountInfo by AIID
// Calls stored procedure: UpdateAccountInfo
// =======================
async function updateAccountInfo(aiid, updates) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("AIID", sql.Int, aiid)
    .input("AccountID", sql.Int, updates.AccountID) // your proc expects AccountID too
    .input("VenueTypeID", sql.Int, updates.VenueTypeID)
    .input("EntCityID", sql.Int, updates.EntCityID)
    .input("isVenueCompany", sql.Bit, updates.isVenueCompany)
    .input("isEventCompany", sql.Bit, updates.isEventCompany)
    .input("isRecordLabel", sql.Bit, updates.isRecordLabel)
    .execute("UpdateAccountInfo");
}

// =======================
// Deactivate AccountInfo by AIID
// Calls stored procedure: DeactivateAccountInfo
// =======================
async function deactivateAccountInfo(aiid) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("AIID", sql.Int, aiid)
    .execute("DeactivateAccountInfo");
}

// =======================
// Reactivate AccountInfo by AIID
// Calls stored procedure: ReactivateAccountInfo
// =======================
async function reactivateAccountInfo(aiid) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("AIID", sql.Int, aiid)
    .execute("ReactivateAccountInfo");
}

// =======================
// Delete AccountInfo by AIID
// Calls stored procedure: DeleteAccountInfo
// =======================
async function deleteAccountInfo(aiid) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("AIID", sql.Int, aiid)
    .execute("DeleteAccountInfo");
}

// =======================
// Exports
// =======================
module.exports = {
  getAllAccountInfo,
  getAccountInfoById,
  createAccountInfo,
  updateAccountInfo,
  deactivateAccountInfo,
  reactivateAccountInfo,
  deleteAccountInfo,
};
