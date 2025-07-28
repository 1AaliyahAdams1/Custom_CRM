const sql = require("mssql");
const dbConfig = require("../dbConfig");

// =======================
// Gets all users who have access to the DealRoom
// =======================
async function getUsersWithAccess(dealRoomId) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("DealRoomID", sql.Int, dealRoomId)
    .query(`
      SELECT dra.*, u.Username
      FROM DealRoomAccess dra
      JOIN Users u ON dra.UserID = u.UserID
      WHERE dra.DealRoomID = @DealRoomID AND dra.IsActive = 1
    `);
  return result.recordset;
}

// =======================
// Gives a user access to the dealroom
// =======================
async function grantAccessToDealRoom(dealRoomId, userId, grantedBy) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("DealRoomID", sql.Int, dealRoomId)
    .input("UserID", sql.Int, userId)
    .input("GrantedBy", sql.Int, grantedBy)
    .query(`
      INSERT INTO DealRoomAccess (DealRoomID, UserID, GrantedBy)
      VALUES (@DealRoomID, @UserID, @GrantedBy)
    `);
}

// =======================
// Removes access from a user to the dealroom
// =======================
async function revokeAccess(dealRoomId, userId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("DealRoomID", sql.Int, dealRoomId)
    .input("UserID", sql.Int, userId)
    .query(`
      UPDATE DealRoomAccess
      SET IsActive = 0
      WHERE DealRoomID = @DealRoomID AND UserID = @UserID
    `);
}

// =======================
// Exports
// =======================
module.exports = {
  getUsersWithAccess,
  grantAccessToDealRoom,
  revokeAccess
};
