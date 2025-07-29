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

//All Stored procedures
// CreateActionType
// GetAllActionType
// GetActionTypeByID
// UpdateActionTpype
// DeactivateActionType
// ReactivateActionType
// DeleteActionType

// =======================
// Exports
// =======================
module.exports = {
  getAllActionTypes
};
