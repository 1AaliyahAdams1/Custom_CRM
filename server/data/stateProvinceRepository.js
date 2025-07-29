const sql = require("mssql");
const dbConfig = require("../dbConfig");

// =======================
// Get all state/provinces (sorted)
// =======================
async function getAllStates() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT sp.StateProvinceID, sp.StateProvinceName, sp.CountryID, c.CountryName
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

// =======================
// Get state/province by ID
// =======================
async function getStateById(id) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("StateProvinceID", sql.Int, id)
      .query(`
        SELECT sp.StateProvinceID, sp.StateProvinceName, sp.CountryID, c.CountryName
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

// =======================
// Create a new state/province
// =======================
async function createState(stateData) {
  try {
    const { StateProvinceName, CountryID } = stateData;
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("StateProvinceName", sql.NVarChar(100), StateProvinceName)
      .input("CountryID", sql.Int, CountryID)
      .query(`
        INSERT INTO StateProvince (StateProvinceName, CountryID)
        VALUES (@StateProvinceName, @CountryID);
        SELECT SCOPE_IDENTITY() AS StateProvinceID;
      `);
    return result.recordset[0]; // { StateProvinceID: newId }
  } catch (error) {
    console.error("StateProvince Repo Error [createState]:", error);
    throw error;
  }
}

// =======================
// Update state/province by ID
// =======================
async function updateState(id, stateData) {
  try {
    const { StateProvinceName, CountryID } = stateData;
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("StateProvinceID", sql.Int, id)
      .input("StateProvinceName", sql.NVarChar(100), StateProvinceName)
      .input("CountryID", sql.Int, CountryID)
      .query(`
        UPDATE StateProvince
        SET StateProvinceName = @StateProvinceName,
            CountryID = @CountryID
        WHERE StateProvinceID = @StateProvinceID
      `);
    return { message: "State/Province updated successfully", StateProvinceID: id };
  } catch (error) {
    console.error("StateProvince Repo Error [updateState]:", error);
    throw error;
  }
}

// =======================
// Delete state/province by ID
// =======================
async function deleteState(id) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("StateProvinceID", sql.Int, id)
      .query(`
        DELETE FROM StateProvince WHERE StateProvinceID = @StateProvinceID
      `);
    return { message: "State/Province deleted successfully", StateProvinceID: id };
  } catch (error) {
    console.error("StateProvince Repo Error [deleteState]:", error);
    throw error;
  }
}

//All stored procedures
//getAllStateProvinces
//getStateProvinceByID
//getIDByStateProvince
//createStateProvince
//updateStateProvince
//deactivateStateProvince
//reactivateStateProvince
//deleteStateProvince


// =======================
// Exports
// =======================
module.exports = {
  getAllStates,
  getStateById,
  createState,
  updateState,
  deleteState,
};
