const sql = require("mssql");
const dbConfig = require("../dbConfig");

//Users will have access to a client's Accounts/deals/contacts all linked via account


//======================================
// Get the assigned users for an Account
//======================================
async function getAssignedUsersByAccount(accountId) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("AccountID", sql.Int, accountId)
    .query(`
      SELECT au.*, u.Username, u.Email
      FROM AssignedUser au
      JOIN Users u ON au.UserID = u.UserID
      WHERE au.AccountID = @AccountID
    `);
  return result.recordset;
}

//======================================
// Assign a user access to an account
//======================================
async function assignUserToAccount(accountId, userId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("AccountID", sql.Int, accountId)
    .input("UserID", sql.Int, userId)
    .query(`
      INSERT INTO AssignedUser (AccountID, UserID)
      VALUES (@AccountID, @UserID)
    `);
}

//======================================
// Unassign a user from an account
//======================================
async function unassignUserFromAccount(accountId, userId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("AccountID", sql.Int, accountId)
    .input("UserID", sql.Int, userId)
    .query(`
      DELETE FROM AssignedUser
      WHERE AccountID = @AccountID AND UserID = @UserID
    `);
}

//All stored procedures
//CreateAssignedUser
// GetAssignedUser
// GetAssignedUserByID
// UpdateAssignedUser
// DeactivateAssignedUser
// ReactivateAssignedUser
// DeleteAssignedUser


// =======================
// Exports
// =======================
module.exports = {
  getAssignedUsersByAccount,
  assignUserToAccount,
  unassignUserFromAccount
};
