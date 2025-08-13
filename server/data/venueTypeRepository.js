const sql = require("mssql");
<<<<<<< HEAD
const dbConfig = require("../dbConfig");
=======
const { dbConfig } = require("../dbConfig");
>>>>>>> 8ee82a354bdcaa6d2d0140bdd209d79f69a41035

// =======================
// Get all venue types
// =======================
async function getAllVenueTypes() {
<<<<<<< HEAD
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().query("SELECT * FROM VenueType");
  return result.recordset;
=======
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
>>>>>>> 8ee82a354bdcaa6d2d0140bdd209d79f69a41035
}

// =======================
// Create new venue type
// =======================
async function createVenueType(venueTypeName) {
<<<<<<< HEAD
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("VenueTypeName", sql.NVarChar(255), venueTypeName)
    .query("INSERT INTO VenueType (VenueTypeName) VALUES (@VenueTypeName)");
}

//All Stored Procedures
//getAllVenueTypes
//getIdByVenueType
//getVenueTypeById
//createVenueType
//deactivateVenueType
//reactivateVenueType
//deleteVenueType
//updateVenueType

// =======================
// Exports
// =======================
module.exports = {
  getAllVenueTypes,
  createVenueType
=======
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
>>>>>>> 8ee82a354bdcaa6d2d0140bdd209d79f69a41035
};
