const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

//======================================
// Get all ActionTypes
//======================================
async function getAllActionTypes() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().execute("GetAllActionType");
    return result.recordset;
  } catch (err) {
    console.error("Database error in getAllActionTypes:", err);
    throw err;
  }
}

//======================================
// Get ActionType by ID
//======================================
async function getActionTypeById(id) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("ActionTypeID", sql.Int, id)
      .execute("GetActionTypeByID");
    return result.recordset[0] || null;
  } catch (err) {
    console.error("Database error in getActionTypeById:", err);
    throw err;
  }
}

//======================================
// Create ActionType
//======================================
async function createActionType(name) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("ActionTypeName", sql.NVarChar(50), name)
      .execute("CreateActionType");
    return { message: "ActionType created successfully" };
  } catch (err) {
    console.error("Database error in createActionType:", err);
    throw err;
  }
}

//======================================
// Update ActionType
//======================================
async function updateActionType(id, name) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("ActionTypeID", sql.Int, id)
      .input("ActionTypeName", sql.NVarChar(50), name)
      .execute("UpdateActionType");
    return { message: "ActionType updated", ActionTypeID: id };
  } catch (err) {
    console.error("Database error in updateActionType:", err);
    throw err;
  }
}

//======================================
// Deactivate ActionType
//======================================
async function deactivateActionType(name) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("ActionTypeName", sql.NVarChar(50), name)
      .execute("DeactivateActionType");
    return { message: "ActionType deactivated", ActionTypeName: name };
  } catch (err) {
    console.error("Database error in deactivateActionType:", err);
    throw err;
  }
}

//======================================
// Reactivate ActionType
//======================================
async function reactivateActionType(name) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("ActionTypeName", sql.NVarChar(50), name)
      .execute("ReactivateActionType");
    return { message: "ActionType reactivated", ActionTypeName: name };
  } catch (err) {
    console.error("Database error in reactivateActionType:", err);
    throw err;
  }
}

//======================================
// Delete ActionType (hard delete)
//======================================
async function deleteActionType(name) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("ActionTypeName", sql.NVarChar(50), name)
      .execute("DeleteActionType");
    return { message: "ActionType permanently deleted", ActionTypeName: name };
  } catch (err) {
    console.error("Database error in deleteActionType:", err);
    throw err;
  }
}

//======================================
// Exports
//======================================
module.exports = {
  getAllActionTypes,
  getActionTypeById,
  createActionType,
  updateActionType,
  deactivateActionType,
  reactivateActionType,
  deleteActionType,
};
