const sql = require("mssql");
const dbConfig = require("../dbConfig");


// =======================
// Get all Teams
// =======================
async function getAllTeams() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().query(`
    SELECT * FROM Team WHERE Active = 1
  `);
  return result.recordset;
}


// =======================
// Gets a specific team by ID
// =======================
async function getTeamById(id) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("TeamID", sql.Int, id)
    .query(`SELECT * FROM Team WHERE TeamID = @TeamID`);
  return result.recordset[0];
}


// =======================
// Creates an empty team 
// =======================
async function createTeam(data) {
  const { TeamName, ManagerID, CityID, TerritoryID, Active } = data;
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("TeamName", sql.NVarChar, TeamName)
    .input("ManagerID", sql.Int, ManagerID)
    .input("CityID", sql.Int, CityID)
    .input("TerritoryID", sql.Int, TerritoryID)
    .input("Active", sql.Bit, Active ?? true)
    .query(`
      INSERT INTO Team (TeamName, ManagerID, CityID, TerritoryID, Active, CreatedAt)
      VALUES (@TeamName, @ManagerID, @CityID, @TerritoryID, @Active, GETDATE())
    `);
}


// =======================
// Update team details
// =======================
async function updateTeam(id, updates) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("TeamID", sql.Int, id)
    .input("TeamName", sql.NVarChar, updates.TeamName)
    .input("ManagerID", sql.Int, updates.ManagerID)
    .input("CityID", sql.Int, updates.CityID)
    .input("TerritoryID", sql.Int, updates.TerritoryID)
    .input("Active", sql.Bit, updates.Active)
    .query(`
      UPDATE Team
      SET TeamName = @TeamName, ManagerID = @ManagerID, CityID = @CityID, TerritoryID = @TerritoryID
      WHERE TeamID = @TeamID
    `);
}


// =======================
// Deletes a team [sets active to 0]
// =======================
async function deleteTeam(id) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("TeamID", sql.Int, id)
    .query(`UPDATE Team SET Active = 0 WHERE TeamID = @TeamID`);
}

//All Stored Procedures
//getAllTeams
//getTeamByID
//getIDByTeamName
//createTeam
//updateTeam
//deactivateTeam
//reactivateTeam
//deleteTeam


module.exports = {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam
};
