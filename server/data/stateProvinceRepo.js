const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Get all state/provinces (sorted)
async function getAllStates() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT sp.StateProvinceID, sp.StateProvinceName, c.CountryName
      FROM StateProvince sp
      LEFT JOIN Country c ON sp.CountryID = c.CountryID
      ORDER BY sp.StateProvinceName
    `);
    return result.recordset;
  } catch (error) {
    console.error("StateProvince Repo Error [getAllStates]:", error);
    throw error;
  }
}

// Get state/province by ID
async function getStateById(id) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("StateProvinceID", sql.Int, id)
      .query(`
        SELECT sp.StateProvinceID, sp.StateProvinceName, c.CountryName
        FROM StateProvince sp
        LEFT JOIN Country c ON sp.CountryID = c.CountryID
        WHERE sp.StateProvinceID = @StateProvinceID
      `);
    return result.recordset[0];
  } catch (error) {
    console.error("StateProvince Repo Error [getStateById]:", error);
    throw error;
  }
}

module.exports = {
  getAllStates,
  getStateById,
};
