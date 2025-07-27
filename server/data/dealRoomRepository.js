const sql = require("mssql");
const dbConfig = require("../dbConfig");

// =======================
// Gets the dealroom details using the dealID
// =======================
async function getDealRoomsByDeal(dealId) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("DealID", sql.Int, dealId)
    .query(`
      SELECT * FROM DealRoom
      WHERE DealID = @DealID AND Active = 1
    `);
  return result.recordset;
}

// =======================
// Creates a dealroom
// =======================
async function createDealRoom(data) {
  const { DealID, RoomName, RoomDescription, CreatedBy } = data;
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("DealID", sql.Int, DealID)
    .input("RoomName", sql.VarChar(255), RoomName)
    .input("RoomDescription", sql.VarChar(255), RoomDescription)
    .input("CreatedBy", sql.Int, CreatedBy)
    .query(`
      INSERT INTO DealRoom (DealID, RoomName, RoomDescription, CreatedBy)
      VALUES (@DealID, @RoomName, @RoomDescription, @CreatedBy)
    `);
}

// =======================
// Deactivates/soft deletes a dealroom
// =======================
async function deactivateDealRoom(dealRoomId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("DealRoomID", sql.Int, dealRoomId)
    .query("UPDATE DealRoom SET Active = 0 WHERE DealRoomID = @DealRoomID");
}

// =======================
// Exports
// =======================
module.exports = {
  getDealRoomsByDeal,
  createDealRoom,
  deactivateDealRoom
};
