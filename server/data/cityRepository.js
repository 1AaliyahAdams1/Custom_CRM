const sql = require("mssql");
const dbConfig = require("../dbConfig");

// =======================
// Get all cities
// =======================
async function getAllCities() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .execute("GetCity");
  return result.recordset;
}

// =======================
// Get city by ID
// =======================
async function getCityById(cityId) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("CityID", sql.Int, cityId)
    .execute("GetCityByID");
  return result.recordset[0];
}

// =======================
// Create a new city
// =======================
async function createCity(cityData) {
  const { CityName, EntertainmentCityID = null, StateProvinceID } = cityData;
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("CityName", sql.VarChar(100), CityName)
    .input("EntertainmentCityID", sql.Int, EntertainmentCityID)
    .input("StateProvinceID", sql.Int, StateProvinceID)
    .execute("CreateCity");
  // No inserted ID returned by SP; you can add OUTPUT if needed
}

// =======================
// Update city by ID
// =======================
async function updateCity(cityId, cityData) {
  const { CityName, EntertainmentCityID = null, StateProvinceID } = cityData;
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("CityID", sql.Int, cityId)
    .input("CityName", sql.VarChar(100), CityName)
    .input("EntertainmentCityID", sql.Int, EntertainmentCityID)
    .input("StateProvinceID", sql.Int, StateProvinceID)
    .execute("UpdateCity");
  return { message: "City updated successfully", CityID: cityId };
}

// =======================
// Deactivate city by ID
// =======================
async function deactivateCity(cityId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("CityID", sql.Int, cityId)
    .execute("DeactivateCity");
}

// =======================
// Reactivate city by ID
// =======================
async function reactivateCity(cityId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("CityID", sql.Int, cityId)
    .execute("ReactivateCity");
}

// =======================
// Delete city by ID
// =======================
async function deleteCity(cityId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("CityID", sql.Int, cityId)
    .execute("DeleteCity");
  return { message: "City deleted successfully", CityID: cityId };
}

//All stored procedures
//CreateCity
// GetCity
// GetCityByID
// UpdateCity
// DeactivateCity
// ReactivateCity
// DeleteCity

// =======================
// Exports
// =======================
module.exports = {
  getAllCities,
  getCityById,
  createCity,
  updateCity,
  deactivateCity,
  reactivateCity,
  deleteCity,
};
