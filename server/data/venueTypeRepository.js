const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

// =======================
// Get all venue types
// =======================
async function getAllVenueTypes() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().execute("getAllVenueTypes");
    return result.recordset;
  } catch (error) {
    console.error("VenueType Repo Error [getAllVenueTypes]:", error);
    throw error;
  }
}

// =======================
// Get venue type by ID
// =======================
async function getVenueTypeById(id) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("VenueTypeID", sql.Int, id)
      .execute("getVenueTypeById");
    return result.recordset[0];
  } catch (error) {
    console.error("VenueType Repo Error [getVenueTypeById]:", error);
    throw error;
  }
}

// =======================
// Get ID by venue type name
// =======================
async function getIdByVenueType(venueTypeName) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("VenueTypeName", sql.NVarChar(255), venueTypeName)
      .execute("getIdByVenueType");
    return result.recordset[0];
  } catch (error) {
    console.error("VenueType Repo Error [getIdByVenueType]:", error);
    throw error;
  }
}

// =======================
// Create new venue type
// =======================
async function createVenueType(venueTypeName) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("VenueTypeName", sql.NVarChar(255), venueTypeName)
      .execute("createVenueType");
  } catch (error) {
    console.error("VenueType Repo Error [createVenueType]:", error);
    throw error;
  }
}

// =======================
// Update venue type by ID
// =======================
async function updateVenueType(id, venueTypeName) {
  try {
    if (!venueTypeName) throw new Error("VenueTypeName cannot be null");
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("VenueTypeID", sql.Int, id)
      .input("VenueTypeName", sql.NVarChar(255), venueTypeName)
      .execute("updateVenueType");
  } catch (error) {
    console.error("VenueType Repo Error [updateVenueType]:", error);
    throw error;
  }
}

// =======================
// Deactivate venue type by ID
// =======================
async function deactivateVenueType(id) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("VenueTypeID", sql.Int, id)
      .execute("deactivateVenueType");
  } catch (error) {
    console.error("VenueType Repo Error [deactivateVenueType]:", error);
    throw error;
  }
}

// =======================
// Reactivate venue type by ID
// =======================
async function reactivateVenueType(id) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("VenueTypeID", sql.Int, id)
      .execute("reactivateVenueType");
  } catch (error) {
    console.error("VenueType Repo Error [reactivateVenueType]:", error);
    throw error;
  }
}

// =======================
// Delete venue type by ID 
// =======================
async function deleteVenueType(id) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("VenueTypeID", sql.Int, id)
      .execute("deleteVenueType");
  } catch (error) {
    console.error("VenueType Repo Error [deleteVenueType]:", error);
    throw error;
  }
}

module.exports = {
  getAllVenueTypes,
  getVenueTypeById,
  getIdByVenueType,
  createVenueType,
  updateVenueType,
  deactivateVenueType,
  reactivateVenueType,
  deleteVenueType,
};
