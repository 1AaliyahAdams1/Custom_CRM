const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

// =======================
// Get all active state/provinces, ordered by name
// =======================
async function getAllStates() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().execute("getAllStateProvinces");
  return result.recordset;
}

// =======================
// Get a state/province by ID
// =======================
async function getStateById(id) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("StateProvinceID", sql.Int, id)
    .execute("getStateProvinceByID");
  return result.recordset[0] || null;
}

// =======================
// Get StateProvinceID by name
// =======================
async function getIDByStateProvince(name) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("StateProvince_Name", sql.VarChar(100), name)
    .execute("getIDByStateProvince");
  return result.recordset[0]?.StateProvinceID || null;
}

// =======================
// Create new state/province
// =======================
async function createState(stateData) {
  const { StateProvince_Name, CountryID } = stateData;
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("StateProvince_Name", sql.VarChar(100), StateProvince_Name)
    .input("CountryID", sql.Int, CountryID)
    .execute("createStateProvince");
  return { message: "State/Province created" };
}

// =======================
// Update state/province by ID
// =======================
async function updateState(id, stateData) {
  const { StateProvince_Name, CountryID } = stateData;
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("StateProvinceID", sql.Int, id)
    .input("StateProvince_Name", sql.VarChar(100), StateProvince_Name)
    .input("CountryID", sql.Int, CountryID)
    .execute("updateStateProvince");
  return { message: "State/Province updated", StateProvinceID: id };
}

// =======================
// Deactivate state/province
// =======================
async function deactivateState(id) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("StateProvinceID", sql.Int, id)
    .execute("deactivateStateProvince");
  return { message: "State/Province deactivated", StateProvinceID: id };
}

// =======================
// Reactivate state/province
// =======================
async function reactivateState(id) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("StateProvinceID", sql.Int, id)
    .execute("reactivateStateProvince");
  return { message: "State/Province reactivated", StateProvinceID: id };
}

// =======================
// Delete state/province
// =======================
async function deleteState(id) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("StateProvinceID", sql.Int, id)
    .execute("deleteStateProvince");
  return { message: "State/Province deleted", StateProvinceID: id };
}

module.exports = {
  getAllStates,
  getStateById,
  getIDByStateProvince,
  createState,
  updateState,
  deactivateState,
  reactivateState,
  deleteState,
};
