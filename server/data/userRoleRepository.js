const sql = require("mssql");
const { dbConfig } = require("../dbConfig");


// =======================
// Get all Roles that a User has
// =======================
async function getRolesByUserId(userId) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("UserID", sql.Int, userId)
    .query(`
      SELECT ur.*, r.RoleName
      FROM UserRole ur
      JOIN Roles r ON r.RoleID = ur.RoleID
      WHERE ur.UserID = @UserID AND ur.Active = 1
    `);
  return result.recordset;
}

module.exports = {
  getRolesByUserId
};
