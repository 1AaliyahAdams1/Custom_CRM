const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

// =======================
// Get all teams
// =======================
async function getAllTeams() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().execute("getAllTeams");
    return result.recordset;
  } catch (error) {
    console.error("Team Repo Error [getAllTeams]:", error);
    throw error;
  }
}

// =======================
// Get team by ID
// =======================
async function getTeamById(id) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("TeamID", sql.Int, id)
      .execute("getTeamByID");
    return result.recordset[0];
  } catch (error) {
    console.error("Team Repo Error [getTeamById]:", error);
    throw error;
  }
}

// =======================
// Get team ID by team name
// =======================
async function getIDByTeamName(teamName) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("TeamName", sql.VarChar(100), teamName)
      .execute("getIDByTeamName");
    return result.recordset[0]?.TeamID || null;
  } catch (error) {
    console.error("Team Repo Error [getIDByTeamName]:", error);
    throw error;
  }
}

// =======================
// Create a new team
// =======================
async function createTeam(data) {
  try {
    const { TeamName, ManagerID, CityID } = data;
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("TeamName", sql.VarChar(100), TeamName)
      .input("ManagerID", sql.Int, ManagerID)
      .input("CityID", sql.Int, CityID)
      .execute("createTeam");
  } catch (error) {
    console.error("Team Repo Error [createTeam]:", error);
    throw error;
  }
}

// =======================
// Update team details
// =======================
async function updateTeam(id, data) {
  try {
    const { TeamName, ManagerID, CityID } = data;
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("TeamID", sql.Int, id)
      .input("TeamName", sql.VarChar(100), TeamName)
      .input("ManagerID", sql.Int, ManagerID)
      .input("CityID", sql.Int, CityID)
      .execute("updateTeam");
  } catch (error) {
    console.error("Team Repo Error [updateTeam]:", error);
    throw error;
  }
}

// =======================
// Deactivate team 
// =======================
async function deactivateTeam(id) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("TeamID", sql.Int, id)
      .execute("deactivateTeam");
  } catch (error) {
    console.error("Team Repo Error [deactivateTeam]:", error);
    throw error;
  }
}

// =======================
// Reactivate team 
// =======================
async function reactivateTeam(id) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("TeamID", sql.Int, id)
      .execute("reactivateTeam");
  } catch (error) {
    console.error("Team Repo Error [reactivateTeam]:", error);
    throw error;
  }
}

// =======================
// Delete team 
// =======================
async function deleteTeam(id) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("TeamID", sql.Int, id)
      .execute("deleteTeam");
  } catch (error) {
    console.error("Team Repo Error [deleteTeam]:", error);
    throw error;
  }
}

// =======================
// Exports
// =======================
module.exports = {
  getAllTeams,
  getTeamById,
  getIDByTeamName,
  createTeam,
  updateTeam,
  deactivateTeam,
  reactivateTeam,
  deleteTeam,
};
