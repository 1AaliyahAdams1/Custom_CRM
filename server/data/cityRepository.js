const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Get all cities (sorted)
async function getAllCities() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT c.CityID, c.CityName, sp.StateProvinceName, co.CountryName
      FROM City c
      LEFT JOIN StateProvince sp ON c.StateProvinceID = sp.StateProvinceID
      LEFT JOIN Country co ON sp.CountryID = co.CountryID
      ORDER BY c.CityName
    `);
    return result.recordset;
  } catch (error) {
    console.error("City Repository Error [getAllCities]:", error);
    throw error;
  }
}

// Get city by ID
async function getCityById(cityId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("CityID", sql.Int, cityId)
      .query(`
        SELECT c.CityID, c.CityName, sp.StateProvinceName, co.CountryName
        FROM City c
        LEFT JOIN StateProvince sp ON c.StateProvinceID = sp.StateProvinceID
        LEFT JOIN Country co ON sp.CountryID = co.CountryID
        WHERE c.CityID = @CityID
      `);
    return result.recordset[0];
  } catch (error) {
    console.error("City Repository Error [getCityById]:", error);
    throw error;
  }
}

module.exports = {
  getAllCities,
  getCityById,
};
