const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

// ==========================================
// Get all countries (sorted by CountryName)
// ==========================================
async function getAllCountries() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT CountryID, CountryName, CountryCode, CurrencyID, Active
      FROM Country
      ORDER BY CountryName
    `);
    return result.recordset;
  } catch (error) {
    console.error("Country Repo Error [getAllCountries]:", error);
    throw error;
  }
}

// ==========================================
// Get country by ID
// ==========================================
async function getCountryById(id) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("CountryID", sql.Int, id)
      .query(`
        SELECT CountryID, CountryName, CountryCode, CurrencyID, Active
        FROM Country
        WHERE CountryID = @CountryID
      `);
    return result.recordset[0];
  } catch (error) {
    console.error("Country Repo Error [getCountryById]:", error);
    throw error;
  }
}

// ==========================================
// Create new country
// ==========================================
async function createCountry(data) {
  try {
    const { CountryName, CountryCode, CurrencyID } = data;
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("CountryName", sql.NVarChar(100), CountryName)
      .input("CountryCode", sql.VarChar(5), CountryCode)
      .input("CurrencyID", sql.Int, CurrencyID)
      .query(`
        INSERT INTO Country (CountryName, CountryCode, CurrencyID, Active)
        VALUES (@CountryName, @CountryCode, @CurrencyID, 1);
        SELECT SCOPE_IDENTITY() AS CountryID;
      `);
    return result.recordset[0];
  } catch (error) {
    console.error("Country Repo Error [createCountry]:", error);
    throw error;
  }
}

// ==========================================
// Update existing country by ID
// ==========================================
async function updateCountry(id, data) {
  try {
    const { CountryName, CountryCode, CurrencyID, Active = 1 } = data;
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("CountryID", sql.Int, id)
      .input("CountryName", sql.NVarChar(100), CountryName)
      .input("CountryCode", sql.VarChar(5), CountryCode)
      .input("CurrencyID", sql.Int, CurrencyID)
      .input("Active", sql.Bit, Active)
      .query(`
        UPDATE Country
        SET CountryName = @CountryName,
            CountryCode = @CountryCode,
            CurrencyID = @CurrencyID,
            Active = @Active
        WHERE CountryID = @CountryID
      `);
    return { message: "Country updated", CountryID: id };
  } catch (error) {
    console.error("Country Repo Error [updateCountry]:", error);
    throw error;
  }
}

// ==========================================
// Soft delete country by ID (set Active = 0)
// ==========================================
async function deleteCountry(id) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("CountryID", sql.Int, id)
      .query(`
        UPDATE Country
        SET Active = 0
        WHERE CountryID = @CountryID
      `);
    return { message: "Country soft deleted", CountryID: id };
  } catch (error) {
    console.error("Country Repo Error [deleteCountry]:", error);
    throw error;
  }
}

//All stored procedures
//CreateCountry
// GetCountry
// GetCountryByID
// UpdateCountry
// DeactivateCountry
// ReactivateCountry
// DeleteCountry


// =======================
// Exports
// =======================
module.exports = {
  getAllCountries,
  getCountryById,
  createCountry,
  updateCountry,
  deleteCountry,
};
