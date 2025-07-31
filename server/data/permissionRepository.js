const sql = require("mssql");
const dbConfig = require("../dbConfig");

// =======================
// Get all permissions
// =======================
async function getAllPermissions() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .execute("getAllPermissions");
  return result.recordset;
}

// =======================
// Get permission by ID
// =======================
async function getPermissionById(permissionId) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("PermissionID", sql.Int, permissionId)
    .execute("getPermissionByID");
  return result.recordset[0];
}

// =======================
// Create permission
// =======================
async function createPermission(permissionName, description, entityAffected, actionTypeId, scope) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("PermissionName", sql.VarChar(100), permissionName)
    .input("Description", sql.VarChar(255), description)
    .input("EntityAffected", sql.VarChar(50), entityAffected)
    .input("ActionTypeID", sql.Int, actionTypeId)
    .input("Scope", sql.VarChar(50), scope)
    .execute("createPermission");
}

// =======================
// Update permission
// =======================
async function updatePermission(permissionId, permissionName, description, entityAffected, actionTypeId, scope) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("PermissionID", sql.Int, permissionId)
    .input("PermissionName", sql.VarChar(100), permissionName)
    .input("Description", sql.VarChar(255), description)
    .input("EntityAffected", sql.VarChar(50), entityAffected)
    .input("ActionTypeID", sql.Int, actionTypeId)
    .input("Scope", sql.VarChar(50), scope)
    .execute("updatePermission");
}

// =======================
// Deactivate permission
// =======================
async function deactivatePermission(permissionId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("PermissionID", sql.Int, permissionId)
    .execute("deactivatePermission");
}

// =======================
// Reactivate permission
// =======================
async function reactivatePermission(permissionId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("PermissionID", sql.Int, permissionId)
    .execute("reactivatePermission");
}

// =======================
// Delete permission
// =======================
async function deletePermission(permissionId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("PermissionID", sql.Int, permissionId)
    .execute("deletePermission");
}

// =======================
// Exports
// =======================
module.exports = {
  getAllPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deactivatePermission,
  reactivatePermission,
  deletePermission,
};
