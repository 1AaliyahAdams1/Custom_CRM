const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

// =======================
// Get all Permissions
// =======================
async function getAllPermissions() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().query(`SELECT * FROM Permission`);
  return result.recordset;
}

//All Stored Procedures
//getAllPermissions
//createPermission
//updatePermission
//deactivatePermission
//reactivatePermission
//deletePermission

module.exports = {
  getAllPermissions
};
