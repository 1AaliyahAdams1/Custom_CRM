const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

// =======================
// Get all active roles
// =======================
async function getAllRoles() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .execute("getAllRoles");
  return result.recordset;
}

// =======================
// Get RoleID by RoleName
// =======================
async function getIDByRoleName(roleName) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("RoleName", sql.VarChar(100), roleName)
    .execute("getIDByRoleName");
  return result.recordset[0]?.RoleID || null;
}

// =======================
// Get Role details by RoleID
// =======================
async function getRoleNameByID(roleId) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("RoleID", sql.Int, roleId)
    .execute("getRoleNameByID");
  return result.recordset[0] || null;
}

// =======================
// Create a new Role
// =======================
async function createRole(roleData) {
  const { RoleName, RoleDescription, RoleLevel } = roleData;
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("RoleName", sql.VarChar(100), RoleName)
    .input("RoleDescription", sql.VarChar(100), RoleDescription)
    .input("RoleLevel", sql.Int, RoleLevel)
    .execute("createRole");
  return { message: "Role created" };
}

// =======================
// Update existing Role
// =======================
async function updateRole(roleId, roleData) {
  const { RoleName, RoleDescription, RoleLevel } = roleData;
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("RoleID", sql.Int, roleId)
    .input("RoleName", sql.VarChar(100), RoleName)
    .input("RoleDescription", sql.VarChar(100), RoleDescription)
    .input("RoleLevel", sql.Int, RoleLevel)
    .execute("updateRole");
  return { message: "Role updated" };
}

// =======================
// Deactivate Role
// =======================
async function deactivateRole(roleId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("RoleID", sql.Int, roleId)
    .execute("deactivateRole");
  return { message: "Role deactivated" };
}

// =======================
// Reactivate Role
// =======================
async function reactivateRole(roleId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("RoleID", sql.Int, roleId)
    .execute("reactivateRole");
  return { message: "Role reactivated" };
}

// =======================
// Delete Role
// =======================
async function deleteRole(roleId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("RoleID", sql.Int, roleId)
    .execute("deleteRole");
  return { message: "Role deleted" };
}

module.exports = {
  getAllRoles,
  getIDByRoleName,
  getRoleNameByID,
  createRole,
  updateRole,
  deactivateRole,
  reactivateRole,
  deleteRole,
};
