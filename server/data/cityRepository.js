const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Get all cities (sorted alphabetically)
async function getAllCities() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT CityID, CityName 
      FROM City 
      ORDER BY CityName
    `);
    return result.recordset;
  } catch (error) {
    console.error("City Repository Error [getAllCities]:", error);
    throw error;
  }
}

// Get a single city by ID
async function getCityById(cityId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("CityID", sql.Int, cityId)
      .query("SELECT * FROM City WHERE CityID = @CityID");
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
