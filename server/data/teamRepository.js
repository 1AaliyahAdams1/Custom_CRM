const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

//======================================
// Get all active teams
//======================================
async function getAllTeams() {
  try {
    const query = `
      SELECT 
        TeamID,
        TeamName,
        ManagerID,
        Active,
        CreatedAt
      FROM dbo.Team
      WHERE Active = 1
      ORDER BY TeamName
    `;
    
    console.log('📡 Repository: Executing query:', query);
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(query);
    console.log('📡 Repository: Query result:', result);
    console.log('📡 Repository: Recordset:', result.recordset);
    console.log('📡 Repository: Fetched teams:', result.recordset.length, 'active teams');
    
    if (result.recordset.length > 0) {
      console.log('📡 Repository: First team sample:', result.recordset[0]);
    }
    
    return result.recordset;
  } catch (error) {
    console.error('❌ Repository error fetching teams:', error);
    console.error('❌ Repository error stack:', error.stack);
    throw error;
  }
}

//======================================
// Get team by ID
//======================================
async function getTeamById(teamId) {
  try {
    const query = `
      SELECT 
        TeamID,
        TeamName,
        ManagerID,
        CreatedAt,
        Active
      FROM dbo.Team 
      WHERE TeamID = @teamId AND Active = 1
    `;
    
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('teamId', sql.Int, teamId)
      .query(query);
    
    if (result.recordset.length === 0) {
      return null;
    }
    
    return result.recordset[0];
  } catch (error) {
    console.error('Error fetching team by ID:', error);
    throw error;
  }
}

//======================================
// Create new team
//======================================
async function createTeam(teamData) {
  try {
    const { TeamName, ManagerID } = teamData;
    
    const query = `
      INSERT INTO dbo.Team (TeamName, ManagerID, CreatedAt, Active)
      OUTPUT INSERTED.TeamID, INSERTED.TeamName, INSERTED.ManagerID, INSERTED.CreatedAt, INSERTED.Active
      VALUES (@TeamName, @ManagerID, GETDATE(), 1)
    `;
    
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('TeamName', sql.VarChar(100), TeamName)
      .input('ManagerID', sql.Int, ManagerID)
      .query(query);
    
    console.log('📡 Created team:', result.recordset[0]);
    return result.recordset[0];
  } catch (error) {
    console.error('Error creating team:', error);
    throw error;
  }
}

//======================================
// Update team
//======================================
async function updateTeam(teamId, teamData) {
  try {
    const { TeamName, ManagerID } = teamData;
    
    const query = `
      UPDATE dbo.Team 
      SET TeamName = @TeamName, ManagerID = @ManagerID
      OUTPUT INSERTED.TeamID, INSERTED.TeamName, INSERTED.ManagerID, INSERTED.CreatedAt, INSERTED.Active
      WHERE TeamID = @teamId AND Active = 1
    `;
    
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('teamId', sql.Int, teamId)
      .input('TeamName', sql.VarChar(100), TeamName)
      .input('ManagerID', sql.Int, ManagerID)
      .query(query);
    
    if (result.recordset.length === 0) {
      throw new Error('Team not found or already inactive');
    }
    
    console.log('📡 Updated team:', result.recordset[0]);
    return result.recordset[0];
  } catch (error) {
    console.error('Error updating team:', error);
    throw error;
  }
}

//======================================
// Deactivate team (soft delete)
//======================================
async function deactivateTeam(teamId) {
  try {
    const query = `
      UPDATE dbo.Team 
      SET Active = 0
      WHERE TeamID = @teamId
    `;
    
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('teamId', sql.Int, teamId)
      .query(query);
    
    if (result.rowsAffected[0] === 0) {
      throw new Error('Team not found');
    }
    
    console.log('📡 Deactivated team ID:', teamId);
    return { message: 'Team deactivated successfully' };
  } catch (error) {
    console.error('Error deactivating team:', error);
    throw error;
  }
}

//======================================
// Reactivate team
//======================================
async function reactivateTeam(teamId) {
  try {
    const query = `
      UPDATE dbo.Team 
      SET Active = 1
      WHERE TeamID = @teamId
    `;
    
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('teamId', sql.Int, teamId)
      .query(query);
    
    if (result.rowsAffected[0] === 0) {
      throw new Error('Team not found');
    }
    
    console.log('📡 Reactivated team ID:', teamId);
    return { message: 'Team reactivated successfully' };
  } catch (error) {
    console.error('Error reactivating team:', error);
    throw error;
  }
}

//======================================
// Exports
//======================================
module.exports = {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deactivateTeam,
  reactivateTeam
};