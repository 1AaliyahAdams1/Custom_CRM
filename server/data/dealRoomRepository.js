const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

// =======================
// Get all active dealrooms for a given deal
// =======================
async function getDealRoomsByDeal(dealId) {
  if (!dealId) throw new Error("dealId is required");
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("DealID", sql.Int, dealId)
      .query(`SELECT * FROM DealRoom WHERE DealID = @DealID AND Active = 1`);
    return result.recordset;
  } catch (error) {
    console.error("DealRoomRepo Error [getDealRoomsByDeal]:", error);
    throw error;
  }
}

// =======================
// Create a new dealroom
// =======================
async function createDealRoom({ DealID, RoomName, RoomDescription, CreatedBy }) {
  if (!DealID) throw new Error("DealID is required");
  if (!RoomName) throw new Error("RoomName is required");
  if (!CreatedBy) throw new Error("CreatedBy is required");

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("DealID", sql.Int, DealID)
      .input("RoomName", sql.VarChar(255), RoomName)
      .input("RoomDescription", sql.VarChar(255), RoomDescription || null)
      .input("CreatedBy", sql.Int, CreatedBy)
      .execute("CreateDealRoom");
  } catch (error) {
    console.error("DealRoomRepo Error [createDealRoom]:", error);
    throw error;
  }
}

// =======================
// Update existing dealroom by ID
// =======================
async function updateDealRoom(dealRoomId, { DealID, RoomName, RoomDescription, CreatedBy }) {
  if (!dealRoomId) throw new Error("dealRoomId is required");
  if (!DealID) throw new Error("DealID is required");
  if (!RoomName) throw new Error("RoomName is required");
  if (!CreatedBy) throw new Error("CreatedBy is required");

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("DealRoomID", sql.Int, dealRoomId)
      .input("DealID", sql.Int, DealID)
      .input("RoomName", sql.VarChar(255), RoomName)
      .input("RoomDescription", sql.VarChar(255), RoomDescription || null)
      .input("CreatedBy", sql.Int, CreatedBy)
      .execute("UpdateDealRoom");
  } catch (error) {
    console.error("DealRoomRepo Error [updateDealRoom]:", error);
    throw error;
  }
}

// =======================
// Deactivate a dealroom by ID
// =======================
async function deactivateDealRoom(dealRoomId) {
  if (!dealRoomId) throw new Error("dealRoomId is required");

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("DealRoomID", sql.Int, dealRoomId)
      .execute("DeactivateDealRoom");
  } catch (error) {
    console.error("DealRoomRepo Error [deactivateDealRoom]:", error);
    throw error;
  }
}

// =======================
// Reactivate a previously deactivated dealroom by ID
// =======================
async function reactivateDealRoom(dealRoomId) {
  if (!dealRoomId) throw new Error("dealRoomId is required");

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("DealRoomID", sql.Int, dealRoomId)
      .execute("ReactivateDealRoom");
  } catch (error) {
    console.error("DealRoomRepo Error [reactivateDealRoom]:", error);
    throw error;
  }
}

// =======================
// Hard delete a dealroom by ID
// =======================
async function deleteDealRoom(dealRoomId) {
  if (!dealRoomId) throw new Error("dealRoomId is required");

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("DealRoomID", sql.Int, dealRoomId)
      .execute("DeleteDealRoom");
  } catch (error) {
    console.error("DealRoomRepo Error [deleteDealRoom]:", error);
    throw error;
  }
}

// =======================
// Get all dealrooms
// =======================
async function getAllDealRooms() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().execute("GetDealRoom");
    return result.recordset;
  } catch (error) {
    console.error("DealRoomRepo Error [getAllDealRooms]:", error);
    throw error;
  }
}

// =======================
// Get dealroom by ID
// =======================
async function getDealRoomById(dealRoomId) {
  if (!dealRoomId) throw new Error("dealRoomId is required");

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("DealRoomID", sql.Int, dealRoomId)
      .execute("GetDealRoomByID");
    return result.recordset[0] || null;
  } catch (error) {
    console.error("DealRoomRepo Error [getDealRoomById]:", error);
    throw error;
  }
}

module.exports = {
  getDealRoomsByDeal,
  createDealRoom,
  updateDealRoom,
  deactivateDealRoom,
  reactivateDealRoom,
  deleteDealRoom,
  getAllDealRooms,
  getDealRoomById,
};