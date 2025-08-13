const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

// =======================
// Get all countries (sorted)
// =======================
async function getAllCountries() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().execute("GetCountry");
  return result.recordset;
}

// =======================
// Get country by ID
// =======================
async function getCountryById(id) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("CountryID", sql.Int, id)
    .execute("GetCountryByID");
  return result.recordset[0];
}

// =======================
// Create new country
// =======================
async function createCountry(data) {
  const { CountryName, CountryCode, CurrencyID } = data;
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("CountryName", sql.NVarChar(100), CountryName)
    .input("CountryCode", sql.VarChar(5), CountryCode)
    .input("CurrencyID", sql.Int, CurrencyID)
    .execute("CreateCountry");

  return { message: "Country created" };
}

// =======================
// Update country by ID
// =======================
async function updateCountry(id, data) {
  const { CountryName, CountryCode, CurrencyID } = data;
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("CountryID", sql.Int, id)
    .input("CountryName", sql.NVarChar(100), CountryName)
    .input("CountryCode", sql.VarChar(5), CountryCode)
    .input("CurrencyID", sql.Int, CurrencyID)
    .execute("UpdateCountry");
  return { message: "Country updated", CountryID: id };
}

// =======================
// Deactivate country by ID
// =======================
async function deleteCountry(id) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("CountryID", sql.Int, id)
    .execute("DeactivateCountry");
  return { message: "Country deactivated", CountryID: id };
}

// =======================
// Reactivate country by ID
// =======================
async function reactivateCountry(id) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("CountryID", sql.Int, id)
    .execute("ReactivateCountry");
  return { message: "Country reactivated", CountryID: id };
}

// =======================
// Hard delete country by ID 
// =======================
async function hardDeleteCountry(id) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("CountryID", sql.Int, id)
    .execute("DeleteCountry");
  return { message: "Country hard deleted", CountryID: id };
}

module.exports = {
  getAllCountries,
  getCountryById,
  createCountry,
  updateCountry,
  deleteCountry,
  reactivateCountry,
  hardDeleteCountry,
};
