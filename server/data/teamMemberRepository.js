const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

// =======================
// Get all active team members
// =======================
async function getAllTeamMembers() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().execute("getAllTeamMembers");
  return result.recordset;
}

// =======================
// Get all active team members by TeamID
// =======================
async function getTeamMembersByTeamId(teamId) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("TeamID", sql.Int, teamId)
    .execute("getTeamMembersByTeamId");
  return result.recordset;
}

// =======================
// Add a team member to a team
// =======================
async function addTeamMember(data) {
  const { TeamID, UserID } = data;
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("TeamID", sql.Int, TeamID)
    .input("UserID", sql.Int, UserID)
    .input("JoinedAt", sql.DateTime, new Date())
    .execute("addTeamMember");
  return { message: "Team member added" };
}

// =======================
// Deactivate a team member from a team
// =======================
async function deactivateTeamMember(TeamID, UserID) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("TeamID", sql.Int, TeamID)
    .input("UserID", sql.Int, UserID)
    .execute("deactivateTeamMember");
  return { message: "Team member deactivated" };
}

// =======================
// Reactivate a team member in a team
// =======================
async function reactivateTeamMember(TeamID, UserID) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("TeamID", sql.Int, TeamID)
    .input("UserID", sql.Int, UserID)
    .execute("reactivateTeamMember");
  return { message: "Team member reactivated" };
}

// =======================
// Delete a deactivated team member
// =======================
async function deleteTeamMember(TeamID, UserID) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("TeamID", sql.Int, TeamID)
    .input("UserID", sql.Int, UserID)
    .execute("deleteTeamMember");
  return { message: "Team member deleted" };
}

// =======================
// Update a team member's team or user association
// =======================
async function updateTeamMember(TeamMemberID, data) {
  const { TeamID, UserID } = data;
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("TeamMemberID", sql.Int, TeamMemberID)
    .input("TeamID", sql.Int, TeamID)
    .input("UserID", sql.Int, UserID)
    .execute("updateTeamMember");
  return { message: "Team member updated" };
}

module.exports = {
  getAllTeamMembers,
  getTeamMembersByTeamId,
  addTeamMember,
  deactivateTeamMember,
  reactivateTeamMember,
  deleteTeamMember,
  updateTeamMember,
};
