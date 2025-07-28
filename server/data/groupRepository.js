const sql = require("mssql");
const dbConfig = require("../dbConfig");

// =======================
// Get all groups
// =======================
async function getAllGroups() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().query(`
    SELECT * FROM Groups ORDER BY CreatedAt DESC
  `);
  return result.recordset;
}

// =======================
// Create a group
// =======================
async function createGroup(groupName) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("GroupName", sql.VarChar(255), groupName)
    .query(`
      INSERT INTO Groups (GroupName, Active, CreatedAt)
      VALUES (@GroupName, 1, GETDATE())
    `);
}

// =======================
// Update a group
// =======================
async function updateGroup(groupId, groupName, active) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("GroupID", sql.Int, groupId)
    .input("GroupName", sql.VarChar(255), groupName)
    .input("Active", sql.Bit, active)
    .query(`
      UPDATE Groups
      SET GroupName = @GroupName,
          Active = @Active,
          UpdatedAt = GETDATE()
      WHERE GroupID = @GroupID
    `);
}

// =======================
// Delete a group
// =======================
async function deleteGroup(groupId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("GroupID", sql.Int, groupId)
    .query("DELETE FROM Groups WHERE GroupID = @GroupID");
}

// =======================
// Exports
// =======================
module.exports = {
  getAllGroups,
  createGroup,
  updateGroup,
  deleteGroup,
};
