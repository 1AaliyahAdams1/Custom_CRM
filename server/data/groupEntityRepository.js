const sql = require("mssql");
const dbConfig = require("../dbConfig");

// =======================
// Get all active entities for a group
// =======================
async function getEntitiesByGroup(groupId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("GroupID", sql.Int, groupId)
      .execute("getEntitiesByGroup");
    return result.recordset;
  } catch (error) {
    console.error("DB error in getEntitiesByGroup:", error);
    throw error;
  }
}

// =======================
// Assign entity to group
// =======================
async function addEntityToGroup(groupId, entityId, entityTypeId) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("GroupID", sql.Int, groupId)
      .input("EntityID", sql.Int, entityId)
      .input("EntityTypeID", sql.Int, entityTypeId)
      .execute("addEntityToGroup");
  } catch (error) {
    console.error("DB error in addEntityToGroup:", error);
    throw error;
  }
}

// =======================
// Deactivate an entity from a group
// =======================
async function deactivateGroupEntity(groupEntityId) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("GroupEntityID", sql.Int, groupEntityId)
      .execute("deactivateGroupEntity");
  } catch (error) {
    console.error("DB error in deactivateGroupEntity:", error);
    throw error;
  }
}

// =======================
// Reactivate an entity in a group
// =======================
async function reactivateGroupEntity(groupEntityId) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("GroupEntityID", sql.Int, groupEntityId)
      .execute("reactivateGroupEntity");
  } catch (error) {
    console.error("DB error in reactivateGroupEntity:", error);
    throw error;
  }
}

// =======================
// Delete an entity from a group 
// =======================
async function deleteGroupEntity(groupEntityId) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("GroupEntityID", sql.Int, groupEntityId)
      .execute("deleteGroupEntity");
  } catch (error) {
    console.error("DB error in deleteGroupEntity:", error);
    throw error;
  }
}

// =======================
// Exports
// =======================
module.exports = {
  getEntitiesByGroup,
  addEntityToGroup,
  deactivateGroupEntity,
  reactivateGroupEntity,
  deleteGroupEntity
};
