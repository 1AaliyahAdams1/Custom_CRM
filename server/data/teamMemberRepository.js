const sql = require("mssql");
const { dbConfig } = require("../dbConfig");


// =======================
// Get all members of the team [pulls all teams and their respective members]
// =======================
async function getAllTeamMembers() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().query(`
    SELECT * FROM TeamMember
  `);
  return result.recordset;
}


// =======================
// Get all Team Members by specific team id
// =======================
async function getTeamMembersByTeamId(teamId) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("TeamID", sql.Int, teamId)
    .query(`SELECT * FROM TeamMember WHERE TeamID = @TeamID`);
  return result.recordset;
}


// =======================
// Add a team member to a team
// =======================
async function addTeamMember(data) {
  const { TeamID, UserID, Active } = data;
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("TeamID", sql.Int, TeamID)
    .input("UserID", sql.Int, UserID)
    .input("Active", sql.Bit, Active ?? true)
    .query(`
      INSERT INTO TeamMember (TeamID, UserID, JoinedAt, Active)
      VALUES (@TeamID, @UserID, GETDATE(), @Active)
    `);
}


// =======================
// Remove a team member from a team [Sets active to 0]
// =======================
async function removeTeamMember(teamMemberId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("TeamMemberID", sql.Int, teamMemberId)
    .query(`UPDATE TeamMember SET Active = 0 WHERE TeamMemberID = @TeamMemberID`);
}

module.exports = {
  getAllTeamMembers,
  getTeamMembersByTeamId,
  addTeamMember,
  removeTeamMember
};
