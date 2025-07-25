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

module.exports = {
  getAllPermissions
};
