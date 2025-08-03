const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

//======================================
// Get all activity types 
//======================================
const getAllActivityTypes = async () => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().execute("GetActivityType");
    return result.recordset;
  } catch (error) {
    console.error("Error fetching activity types:", error);
    throw error;
  }
};

//======================================
// Get activity type by ID
//======================================
const getActivityTypeById = async (TypeID) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("TypeID", sql.Int, TypeID)
      .execute("GetActivityTypeByID");
    return result.recordset[0] || null;
  } catch (error) {
    console.error("Error fetching activity type by ID:", error);
    throw error;
  }
};

//======================================
// Create a new activity type
//======================================
const createActivityType = async (data) => {
  const { TypeName, Description } = data;

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("TypeName", sql.VarChar(50), TypeName)
      .input("Description", sql.VarChar(255), Description)
      .execute("CreateActivityType");

    return true;
  } catch (error) {
    console.error("Error creating activity type:", error);
    throw error;
  }
};

//======================================
// Update an activity type by ID
//======================================
const updateActivityType = async (TypeID, data) => {
  const { TypeName, Description } = data;

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("TypeID", sql.Int, TypeID)
      .input("TypeName", sql.VarChar(50), TypeName)
      .input("Description", sql.VarChar(255), Description)
      .execute("UpdateActivityType");

    return true;
  } catch (error) {
    console.error("Error updating activity type:", error);
    throw error;
  }
};

//======================================
// Deactivate activity type
//======================================
const deactivateActivityType = async (TypeID) => {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("TypeID", sql.Int, TypeID)
      .execute("DeactivateActivityType");

    return true;
  } catch (error) {
    console.error("Error deactivating activity type:", error);
    throw error;
  }
};

//======================================
// Reactivate activity type
//======================================
const reactivateActivityType = async (TypeID) => {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("TypeID", sql.Int, TypeID)
      .execute("ReactivateActivityType");

    return true;
  } catch (error) {
    console.error("Error reactivating activity type:", error);
    throw error;
  }
};

//======================================
// Delete activity type
//======================================
const deleteActivityType = async (TypeID) => {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("TypeID", sql.Int, TypeID)
      .execute("DeleteActivityType");

    return true;
  } catch (error) {
    console.error("Error deleting activity type:", error);
    throw error;
  }
};

//======================================
// Exports
//======================================
module.exports = {
  getAllActivityTypes,
  getActivityTypeById,
  createActivityType,
  updateActivityType,
  deactivateActivityType,
  reactivateActivityType,
  deleteActivityType,
};
