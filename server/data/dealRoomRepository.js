const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

// =======================
// Get all active dealrooms for a given deal
// =======================
async function getDealRoomsByDeal(dealId) {
  if (!dealId) throw new Error("Deal ID is required");
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("DealID", sql.Int, dealId)
      .query(`SELECT * FROM DealRoom WHERE DealID = @DealID AND Active = 1`);
    return result.recordset;
  } catch (error) {
    console.error("DealRoom Repo Error [getDealRoomsByDeal]:", error);
    throw error;
  }
}

// =======================
// Create a new dealroom
// =======================
async function createDealRoom({
  DealID,
  RoomName,
  RoomDescription,
  CreatedBy,
}) {
  if (!DealID) throw new Error("Deal ID is required");
  if (!RoomName) throw new Error("Room Name is required");
  if (!CreatedBy) throw new Error("Created By is required");

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("DealID", sql.Int, DealID)
      .input("RoomName", sql.VarChar(255), RoomName)
      .input("RoomDescription", sql.VarChar(255), RoomDescription || null)
      .input("CreatedBy", sql.Int, CreatedBy)
      .execute("CreateDealRoom");

    return {
      message: "DealRoom created successfully",
      DealRoomID: result.recordset[0]?.DealRoomID || null,
    };
  } catch (error) {
    console.error("DealRoom Repo Error [createDealRoom]:", error);
    throw error;
  }
}

// =======================
// Update existing dealroom by ID
// =======================
async function updateDealRoom(
  dealRoomId,
  { DealID, RoomName, RoomDescription, CreatedBy }
) {
  if (!dealRoomId) throw new Error("DealRoom ID is required");
  if (!DealID) throw new Error("Deal ID is required");
  if (!RoomName) throw new Error("Room Name is required");
  if (!CreatedBy) throw new Error("Created By is required");

  try {
    const pool = await sql.connect(dbConfig);

    // Check if dealroom exists
    const existing = await pool
      .request()
      .input("DealRoomID", sql.Int, dealRoomId)
      .execute("GetDealRoomByID");

    if (!existing.recordset.length) {
      throw new Error("DealRoom not found");
    }

    await pool
      .request()
      .input("DealRoomID", sql.Int, dealRoomId)
      .input("DealID", sql.Int, DealID)
      .input("RoomName", sql.VarChar(255), RoomName)
      .input("RoomDescription", sql.VarChar(255), RoomDescription || null)
      .input("CreatedBy", sql.Int, CreatedBy)
      .execute("UpdateDealRoom");

    return { message: "DealRoom updated successfully", DealRoomID: dealRoomId };
  } catch (error) {
    console.error("DealRoom Repo Error [updateDealRoom]:", error);
    throw error;
  }
}

// =======================
// Deactivate a dealroom by ID
// =======================
async function deactivateDealRoom(dealRoomId) {
  if (!dealRoomId) throw new Error("DealRoom ID is required");

  try {
    const pool = await sql.connect(dbConfig);

    // Check if dealroom exists
    const existing = await pool
      .request()
      .input("DealRoomID", sql.Int, dealRoomId)
      .execute("GetDealRoomByID");

    if (!existing.recordset.length) {
      throw new Error("DealRoom not found");
    }

    await pool
      .request()
      .input("DealRoomID", sql.Int, dealRoomId)
      .execute("DeactivateDealRoom");

    return {
      message: "DealRoom deactivated successfully",
      DealRoomID: dealRoomId,
    };
  } catch (error) {
    console.error("DealRoom Repo Error [deactivateDealRoom]:", error);
    throw error;
  }
}

// =======================
// Reactivate a previously deactivated dealroom by ID
// =======================
async function reactivateDealRoom(dealRoomId) {
  if (!dealRoomId) throw new Error("DealRoom ID is required");

  try {
    const pool = await sql.connect(dbConfig);

    // Check if dealroom exists
    const existing = await pool
      .request()
      .input("DealRoomID", sql.Int, dealRoomId)
      .execute("GetDealRoomByID");

    if (!existing.recordset.length) {
      throw new Error("DealRoom not found");
    }

    await pool
      .request()
      .input("DealRoomID", sql.Int, dealRoomId)
      .execute("ReactivateDealRoom");

    return {
      message: "DealRoom reactivated successfully",
      DealRoomID: dealRoomId,
    };
  } catch (error) {
    console.error("DealRoom Repo Error [reactivateDealRoom]:", error);
    throw error;
  }
}

// =======================
// Hard delete a dealroom by ID
// =======================
async function deleteDealRoom(dealRoomId) {
  if (!dealRoomId) throw new Error("DealRoom ID is required");

  try {
    const pool = await sql.connect(dbConfig);

    // Check if dealroom exists
    const existing = await pool
      .request()
      .input("DealRoomID", sql.Int, dealRoomId)
      .execute("GetDealRoomByID");

    if (!existing.recordset.length) {
      throw new Error("DealRoom not found");
    }

    await pool
      .request()
      .input("DealRoomID", sql.Int, dealRoomId)
      .execute("DeleteDealRoom");

    return { message: "DealRoom deleted successfully", DealRoomID: dealRoomId };
  } catch (error) {
    console.error("DealRoom Repo Error [deleteDealRoom]:", error);
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
    console.error("DealRoom Repo Error [getAllDealRooms]:", error);
    throw error;
  }
}

// =======================
// Get dealroom by ID
// =======================
async function getDealRoomById(dealRoomId) {
  if (!dealRoomId) throw new Error("DealRoom ID is required");

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("DealRoomID", sql.Int, dealRoomId)
      .execute("GetDealRoomByID");

    if (!result.recordset.length) {
      throw new Error("DealRoom not found");
    }

    return result.recordset[0];
  } catch (error) {
    console.error("DealRoom Repo Error [getDealRoomById]:", error);
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
