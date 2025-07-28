const sql = require("mssql");
const dbConfig = require("../dbConfig");

// =======================
// Get AccountInfo by AccountID
// =======================
async function getAccountInfoByAccountId(accountId) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("AccountID", sql.Int, accountId)
    .query(`
      SELECT ai.*, vt.VenueTypeName, c.CityName
      FROM AccountInfo ai
      LEFT JOIN VenueType vt ON ai.VenueTypeID = vt.VenueTypeID
      LEFT JOIN City c ON ai.EntCityID = c.CityID
      WHERE ai.AccountID = @AccountID
    `);
  return result.recordset[0];
}

// =======================
// Create AccountInfo entry
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
    .query(`
      INSERT INTO AccountInfo (
        AccountID, VenueTypeID, EntCityID,
        isVenueCompany, isEventCompany, isRecordLabel
      )
      VALUES (
        @AccountID, @VenueTypeID, @EntCityID,
        @isVenueCompany, @isEventCompany, @isRecordLabel
      )
    `);
}

// =======================
// Update AccountInfo by AccountID
// =======================
async function updateAccountInfo(accountId, updates) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("AccountID", sql.Int, accountId)
    .input("VenueTypeID", sql.Int, updates.VenueTypeID)
    .input("EntCityID", sql.Int, updates.EntCityID)
    .input("isVenueCompany", sql.Bit, updates.isVenueCompany)
    .input("isEventCompany", sql.Bit, updates.isEventCompany)
    .input("isRecordLabel", sql.Bit, updates.isRecordLabel)
    .query(`
      UPDATE AccountInfo SET
        VenueTypeID = @VenueTypeID,
        EntCityID = @EntCityID,
        isVenueCompany = @isVenueCompany,
        isEventCompany = @isEventCompany,
        isRecordLabel = @isRecordLabel
      WHERE AccountID = @AccountID
    `);
}

// =======================
// Exports
// =======================
module.exports = {
  getAccountInfoByAccountId,
  createAccountInfo,
  updateAccountInfo
};
