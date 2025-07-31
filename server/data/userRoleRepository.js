const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

// =======================
// Get all roles that a user has
// =======================
async function getRolesByUserId(userId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("UserID", sql.Int, userId)
      .execute("getRolesByUserId");
    return result.recordset;
  } catch (error) {
    console.error("UserRole Repo Error [getRolesByUserId]:", error);
    throw error;
  }
}

// =======================
// Get all users by role ID
// =======================
async function getUsersByRole(roleId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("RoleID", sql.Int, roleId)
      .execute("getUsersByRole");
    return result.recordset;
  } catch (error) {
    console.error("UserRole Repo Error [getUsersByRole]:", error);
    throw error;
  }
}

// =======================
// Assign a role to a user
// =======================
async function assignRoleToUser(userId, roleId, assignedBy, assignedAt = new Date()) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("UserID", sql.Int, userId)
      .input("RoleID", sql.Int, roleId)
      .input("AssignedBy", sql.Int, assignedBy)
      .input("AssignedAt", sql.DateTime, assignedAt)
      .execute("assignRoletoUser");
  } catch (error) {
    console.error("UserRole Repo Error [assignRoleToUser]:", error);
    throw error;
  }
}

// =======================
// Deactivate a role from a user 
// =======================
async function deactivateRoleFromUser(userId, roleId) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("UserID", sql.Int, userId)
      .input("RoleID", sql.Int, roleId)
      .execute("deactivateRolefromUser");
  } catch (error) {
    console.error("UserRole Repo Error [deactivateRoleFromUser]:", error);
    throw error;
  }
}

// =======================
// Reactivate a role for a user
// =======================
async function reactivateRoleFromUser(userId, roleId) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("UserID", sql.Int, userId)
      .input("RoleID", sql.Int, roleId)
      .execute("reactivateRolefromUser");
  } catch (error) {
    console.error("UserRole Repo Error [reactivateRoleFromUser]:", error);
    throw error;
  }
}

// =======================
// Delete a role from a user
// =======================
async function revokeRoleFromUser(userId, roleId) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("UserID", sql.Int, userId)
      .input("RoleID", sql.Int, roleId)
      .execute("revokeRolefromUser");
  } catch (error) {
    console.error("UserRole Repo Error [revokeRoleFromUser]:", error);
    throw error;
  }
}

// =======================
// Update the role of a user
// =======================
async function updateRoleOfUser(userId, oldRoleId, newRoleId) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("UserID", sql.Int, userId)
      .input("OldRoleID", sql.Int, oldRoleId)
      .input("NewRoleID", sql.Int, newRoleId)
      .execute("updateRoleOfUser");
  } catch (error) {
    console.error("UserRole Repo Error [updateRoleOfUser]:", error);
    throw error;
  }
}

module.exports = {
  getRolesByUserId,
  getUsersByRole,
  assignRoleToUser,
  deactivateRoleFromUser,
  reactivateRoleFromUser,
  revokeRoleFromUser,
  updateRoleOfUser,
};
