const sql = require("mssql");
const { dbConfig } = require("../dbConfig");


// =======================
// Get Permissions for a sepcific role
// =======================
async function getPermissionsByRoleId(roleId) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("RoleID", sql.Int, roleId)
    .query(`
      SELECT rp.*, p.PermissionName
      FROM RolePermission rp
      JOIN Permission p ON p.PermissionID = rp.PermissionID
      WHERE rp.RoleID = @RoleID
    `);
  return result.recordset;
}

module.exports = {
  getPermissionsByRoleId
};

//All Stored Procedures
//getPermissionsByRoleId
//createRolePermission
//updateRolePermission
//deactivateRolePermission
//reactivateRolePermission
//deleteRolePermission