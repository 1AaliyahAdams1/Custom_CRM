const sql = require("mssql");
const dbConfig = require("../dbConfig");

// ==========================================
// Get all cities (sorted)
// ==========================================
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

// ==========================================
// Get city by ID
// ==========================================
async function getCityById(cityId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("CityID", sql.Int, cityId)
      .query(`
        SELECT c.CityID, c.CityName, c.StateProvinceID, sp.StateProvinceName, co.CountryName
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

// ==========================================
// Create a new city
// ==========================================
async function createCity(cityData) {
  try {
    const { CityName, StateProvinceID } = cityData;
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("CityName", sql.NVarChar(100), CityName)
      .input("StateProvinceID", sql.Int, StateProvinceID)
      .query(`
        INSERT INTO City (CityName, StateProvinceID)
        VALUES (@CityName, @StateProvinceID);
        SELECT SCOPE_IDENTITY() AS CityID;
      `);
    return result.recordset[0]; // returns { CityID: newId }
  } catch (error) {
    console.error("City Repository Error [createCity]:", error);
    throw error;
  }
}

// ==========================================
// Update city by ID
// ==========================================
async function updateCity(cityId, cityData) {
  try {
    const { CityName, StateProvinceID } = cityData;
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("CityID", sql.Int, cityId)
      .input("CityName", sql.NVarChar(100), CityName)
      .input("StateProvinceID", sql.Int, StateProvinceID)
      .query(`
        UPDATE City
        SET CityName = @CityName,
            StateProvinceID = @StateProvinceID
        WHERE CityID = @CityID
      `);
    return { message: "City updated successfully", CityID: cityId };
  } catch (error) {
    console.error("City Repository Error [updateCity]:", error);
    throw error;
  }
}

// ==========================================
// Delete city by ID
// ==========================================
async function deleteCity(cityId) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("CityID", sql.Int, cityId)
      .query(`
        DELETE FROM City WHERE CityID = @CityID
      `);
    return { message: "City deleted successfully", CityID: cityId };
  } catch (error) {
    console.error("City Repository Error [deleteCity]:", error);
    throw error;
  }
}

// =======================
// Exports
// =======================
module.exports = {
  getAllCities,
  getCityById,
  createCity,
  updateCity,
  deleteCity,
};
