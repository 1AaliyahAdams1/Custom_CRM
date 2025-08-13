const sql = require("mssql");
const dbConfig = require("../dbConfig");

// =======================
// Get all priority levels ordered by PriorityLevelValue
// =======================
async function getAllPriorityLevels() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().execute("getAllPriorityLevels");
  return result.recordset;
}

// =======================
// Get priority level by ID
// =======================
async function getPriorityLevelById(id) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("PriorityLevelID", sql.Int, id)
    .execute("getPriorityLevelByID");
  return result.recordset[0];
}

// =======================
// Create a new priority level
// =======================
async function createPriorityLevel(data) {
  const { PriorityLevelName, PriorityLevelValue } = data;
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("PriorityLevelName", sql.VarChar(100), PriorityLevelName)
    .input("PriorityLevelValue", sql.TinyInt, PriorityLevelValue)
    .execute("createPriorityLevel");
  return { message: "Priority level created" };
}

// =======================
// Update an existing priority level
// =======================
async function updatePriorityLevel(id, data) {
  const { PriorityLevelName, PriorityLevelValue } = data;
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("PriorityLevelID", sql.Int, id)
    .input("PriorityLevelName", sql.VarChar(100), PriorityLevelName)
    .input("PriorityLevelValue", sql.TinyInt, PriorityLevelValue)
    .execute("updatePriorityLevel");
  return { message: "Priority level updated", PriorityLevelID: id };
}

// =======================
// Deactivate a priority level
// =======================
async function deactivatePriorityLevel(id) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("PriorityLevelID", sql.Int, id)
    .execute("deactivatePriorityLevel");
  return { message: "Priority level deactivated", PriorityLevelID: id };
}

// =======================
// Reactivate a priority level
// =======================
async function reactivatePriorityLevel(id) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("PriorityLevelID", sql.Int, id)
    .execute("reactivatePriorityLevel");
  return { message: "Priority level reactivated", PriorityLevelID: id };
}

// =======================
// Delete a priority level
// =======================
async function deletePriorityLevel(id) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("PriorityLevelID", sql.Int, id)
    .execute("deletePriorityLevel");
  return { message: "Priority level deleted", PriorityLevelID: id };
}

//All stored procedures
//getAllPriorityLevels
//getPriorityLevelByID
//getIDByPriorityLevel
//createPriorityLevel
//updatePriorityLevel
//deactivatePriorityLevel
//reactivatePriorityLevel
//deletePriorityLevel

// =======================
// Exports
// =======================
module.exports = {
  getAllPriorityLevels,
  getPriorityLevelById,
  createPriorityLevel,
  updatePriorityLevel,
  deactivatePriorityLevel,
  reactivatePriorityLevel,
  deletePriorityLevel,
};
