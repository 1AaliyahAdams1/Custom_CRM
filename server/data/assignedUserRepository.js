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
// Find AssignedUser by criteria (UserID + AccountID)
// ==========================================
async function findAssignedUser(criteria) {
  const { UserID, AccountID } = criteria;
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("UserID", sql.Int, UserID)
    .input("AccountID", sql.Int, AccountID)
    .query(`
      SELECT *
      FROM AssignedUser
      WHERE UserID = @UserID AND AccountID = @AccountID
    `);
  return result.recordset[0] || null; 
}

// ==========================================
// Find AssignedUsers by AccountID
// ==========================================
async function findAssignedUsersByAccount(accountId) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("AccountID", sql.Int, accountId)
    .query(`
      SELECT 
        au.AccountUserID,
        au.AccountID,
        au.UserID,
        e.EmployeeName,
        au.Active
      FROM AssignedUser au
      JOIN Employee e ON au.UserID = e.EmployeeID
      WHERE au.AccountID = @AccountID AND au.Active = 1
      ORDER BY e.EmployeeName
    `);
  return result.recordset;
}

// ===============================================
// Find active assignment by UserID and AccountID
// ===============================================
async function findActiveAssignment(userId, accountId) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("UserID", sql.Int, userId)
    .input("AccountID", sql.Int, accountId)
    .query(`
      SELECT AccountUserID
      FROM AssignedUser
      WHERE UserID = @UserID 
        AND AccountID = @AccountID 
        AND Active = 1
    `);
  return result.recordset[0] || null;
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
  findAssignedUser,
  findAssignedUsersByAccount,
  findActiveAssignment,
};