const sql = require("mssql");
const dbConfig = require("../dbConfig");

//======================================
// Get all Action Types 
//======================================
async function getAllActionTypes() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().query("SELECT * FROM ActionType");
  return result.recordset;
}

// =======================
// Exports
// =======================
module.exports = {
  getAllActionTypes
};
