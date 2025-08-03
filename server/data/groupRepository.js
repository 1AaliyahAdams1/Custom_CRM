const sql = require("mssql");
const dbConfig = require("../dbConfig");

// =======================
// Get all active groups
// =======================
async function getAllGroups() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().execute("getAllGroups");
    return result.recordset;
  } catch (error) {
    console.error("DB error in getAllGroups:", error);
    throw error;
  }
}

// =======================
// Create a new group
// =======================
async function createGroup(groupName) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("GroupName", sql.VarChar(255), groupName)
      .execute("createGroup");
  } catch (error) {
    console.error("DB error in createGroup:", error);
    throw error;
  }
}

// =======================
// Update a group name
// =======================
async function updateGroup(groupId, groupName) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("GroupID", sql.Int, groupId)
      .input("GroupName", sql.VarChar(255), groupName)
      .execute("updateGroup");
  } catch (error) {
    console.error("DB error in updateGroup:", error);
    throw error;
  }
}

// =======================
// Deactivate a group
// =======================
async function deactivateGroup(groupId) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("GroupID", sql.Int, groupId)
      .execute("deactivateGroup");
  } catch (error) {
    console.error("DB error in deactivateGroup:", error);
    throw error;
  }
}

// =======================
// Reactivate a group
// =======================
async function reactivateGroup(groupId) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("GroupID", sql.Int, groupId)
      .execute("reactivateGroup");
  } catch (error) {
    console.error("DB error in reactivateGroup:", error);
    throw error;
  }
}

// =======================
// Delete a group 
// =======================
async function deleteGroup(groupId) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("GroupID", sql.Int, groupId)
      .execute("deleteGroup");
  } catch (error) {
    console.error("DB error in deleteGroup:", error);
    throw error;
  }
}

// =======================
// Exports
// =======================
module.exports = {
  getAllGroups,
  createGroup,
  updateGroup,
  deactivateGroup,
  reactivateGroup,
  deleteGroup,
};
