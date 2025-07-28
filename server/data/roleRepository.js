const sql = require("mssql");
const { dbConfig } = require("../dbConfig");


// =======================
// Get all Roles
// =======================
async function getAllRoles() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().query(`SELECT * FROM Roles WHERE Active = 1`);
  return result.recordset;
}

module.exports = {
  getAllRoles
};
