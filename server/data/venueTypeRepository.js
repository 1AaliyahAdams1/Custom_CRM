const sql = require("mssql");
const dbConfig = require("../dbConfig");

// =======================
// Get all venue types
// =======================
async function getAllVenueTypes() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().query("SELECT * FROM VenueType");
  return result.recordset;
}

// =======================
// Create new venue type
// =======================
async function createVenueType(venueTypeName) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("VenueTypeName", sql.NVarChar(255), venueTypeName)
    .query("INSERT INTO VenueType (VenueTypeName) VALUES (@VenueTypeName)");
}

// =======================
// Exports
// =======================
module.exports = {
  getAllVenueTypes,
  createVenueType
};
