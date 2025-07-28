const sql = require("mssql");
const dbConfig = require("../dbConfig");

// =======================
// Get all entities for a group
// =======================
async function getEntitiesByGroup(groupId) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("GroupID", sql.Int, groupId)
    .query(`
      SELECT ge.*, et.TypeName
      FROM GroupEntity ge
      JOIN EntityType et ON ge.EntityTypeID = et.EntityTypeID
      WHERE ge.GroupID = @GroupID
    `);
  return result.recordset;
}

// =======================
// Assign entity to group
// =======================
async function addEntityToGroup(groupId, entityId, entityTypeId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("GroupID", sql.Int, groupId)
    .input("EntityID", sql.Int, entityId)
    .input("EntityTypeID", sql.Int, entityTypeId)
    .query(`
      INSERT INTO GroupEntity (GroupID, EntityID, EntityTypeID)
      VALUES (@GroupID, @EntityID, @EntityTypeID)
    `);
}

// =======================
// Remove entity from group
// =======================
async function removeEntityFromGroup(groupEntityId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("GroupEntityID", sql.Int, groupEntityId)
    .query("DELETE FROM GroupEntity WHERE GroupEntityID = @GroupEntityID");
}

// =======================
// Exports
// =======================
module.exports = {
  getEntitiesByGroup,
  addEntityToGroup,
  removeEntityFromGroup,
};
