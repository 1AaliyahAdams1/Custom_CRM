const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Get all countries (sorted)
async function getAllCountries() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT CountryID, CountryName, CountryCode
      FROM Country
      ORDER BY CountryName
    `);
    return result.recordset;
  } catch (error) {
    console.error("Country Repo Error [getAllCountries]:", error);
    throw error;
  }
}

// Get country by ID
async function getCountryById(id) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("CountryID", sql.Int, id)
      .query(`
        SELECT CountryID, CountryName, CountryCode
        FROM Country
        WHERE CountryID = @CountryID
      `);
    return result.recordset[0];
  } catch (error) {
    console.error("Country Repo Error [getCountryById]:", error);
    throw error;
  }
}

module.exports = {
  getAllCountries,
  getCountryById,
};

