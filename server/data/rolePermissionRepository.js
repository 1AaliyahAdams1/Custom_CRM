const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

// =======================
// Get all RolePermissions for a RoleID (active only)
// =======================
async function getPermissionsByRoleId(roleId) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("RoleID", sql.Int, roleId)
    .execute("getPermissionsByRoleId");
  return result.recordset;
}

// =======================
// Create a new RolePermission
// =======================
async function createRolePermission(roleId, permissionId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("RoleID", sql.Int, roleId)
    .input("PermissionID", sql.Int, permissionId)
    .execute("createRolePermission");
  return { message: "RolePermission created" };
}

// =======================
// Update existing RolePermission
// =======================
async function updateRolePermission(rolePermissionId, roleId, permissionId) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("RolePermissionID", sql.Int, rolePermissionId)
    .input("RoleID", sql.Int, roleId)
    .input("PermissionID", sql.Int, permissionId)
    .execute("updateRolePermission");
  return { message: "RolePermission updated" };
}

// =======================
// Deactivate RolePermission (soft delete)
// =======================
async function deactivateRolePermission(rolePermissionId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("RolePermissionID", sql.Int, rolePermissionId)
    .execute("deactivateRolePermission");
  return { message: "RolePermission deactivated" };
}

// =======================
// Reactivate RolePermission
// =======================
async function reactivateRolePermission(rolePermissionId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("RolePermissionID", sql.Int, rolePermissionId)
    .execute("reactivateRolePermission");
  return { message: "RolePermission reactivated" };
}

// =======================
// Delete RolePermission (hard delete)
// =======================
async function deleteRolePermission(rolePermissionId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("RolePermissionID", sql.Int, rolePermissionId)
    .execute("deleteRolePermission");
  return { message: "RolePermission deleted" };
}

module.exports = {
  getPermissionsByRoleId,
  createRolePermission,
  updateRolePermission,
  deactivateRolePermission,
  reactivateRolePermission,
  deleteRolePermission,
};
