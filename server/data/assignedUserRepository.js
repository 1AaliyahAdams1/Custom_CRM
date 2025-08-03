const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

// ==========================================
// Get all AssignedUsers
// ==========================================
async function getAllAssignedUsers() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .execute("GetAssignedUser");
  return result.recordset;
}

// ==========================================
// Get AssignedUser by AccountUserID
// ==========================================
async function getAssignedUserById(accountUserId) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("AccountUserID", sql.Int, accountUserId)
    .execute("GetAssignedUserByID");
  return result.recordset[0]; // single record
}

// ==========================================
// Create AssignedUser
// ==========================================
async function createAssignedUser(data) {
  const { UserID, AccountID } = data;
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("UserID", sql.Int, UserID)
    .input("AccountID", sql.Int, AccountID)
    .execute("CreateAssignedUser");
}

// ==========================================
// Update AssignedUser by AccountUserID
// ==========================================
async function updateAssignedUser(accountUserId, updates) {
  const { UserID, AccountID } = updates;
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("AccountUserID", sql.Int, accountUserId)
    .input("UserID", sql.Int, UserID)
    .input("AccountID", sql.Int, AccountID)
    .execute("UpdateAssignedUser");
}

// ==========================================
// Deactivate AssignedUser by AccountUserID
// ==========================================
async function deactivateAssignedUser(accountUserId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("AccountUserID", sql.Int, accountUserId)
    .execute("DeactivateAssignedUser");
}

// ==========================================
// Reactivate AssignedUser by AccountUserID
// ==========================================
async function reactivateAssignedUser(accountUserId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("AccountUserID", sql.Int, accountUserId)
    .execute("ReactivateAssignedUser");
}

// ==========================================
// Delete AssignedUser by AccountUserID
// ==========================================
async function deleteAssignedUser(accountUserId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("AccountUserID", sql.Int, accountUserId)
    .execute("DeleteAssignedUser");
}

// ==========================================
// Exports
// ==========================================
module.exports = {
  getAllAssignedUsers,
  getAssignedUserById,
  createAssignedUser,
  updateAssignedUser,
  deactivateAssignedUser,
  reactivateAssignedUser,
  deleteAssignedUser,
};