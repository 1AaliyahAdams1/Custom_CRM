const sql = require("mssql");
const dbConfig = require("../dbConfig");

// =======================
// Get all teams
// =======================
async function getAllTeams() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT 
        TeamID,
        TeamName,
        ManagerID,
        Active,
        CreatedAt
      FROM dbo.Team
      ORDER BY TeamName
    `);
    return result.recordset;
  } catch (error) {
    console.error("TeamRepo Error [getAllTeams]:", error);
    throw error;
  }
}

// =======================
// Get team by ID
// =======================
async function getTeamById(teamId) {
  if (!teamId) throw new Error("teamId is required");
  
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("TeamID", sql.Int, teamId)
      .query(`
        SELECT 
          TeamID,
          TeamName,
          ManagerID,
          Active,
          CreatedAt
        FROM dbo.Team
        WHERE TeamID = @TeamID
      `);
    return result.recordset[0] || null;
  } catch (error) {
    console.error("TeamRepo Error [getTeamById]:", error);
    throw error;
  }
}

// =======================
// Create a new team
// =======================
async function createTeam(teamData) {
  const { TeamName, ManagerID } = teamData;

  if (!TeamName) throw new Error("TeamName is required");
  if (!ManagerID) throw new Error("ManagerID is required");

  try {
    const pool = await sql.connect(dbConfig);
    
    const result = await pool.request()
      .input("TeamName", sql.VarChar(100), TeamName)
      .input("ManagerID", sql.Int, ManagerID)
      .input("Active", sql.Bit, 1)
      .query(`
        INSERT INTO dbo.Team (TeamName, ManagerID, Active, CreatedAt)
        VALUES (@TeamName, @ManagerID, @Active, GETDATE());
        SELECT SCOPE_IDENTITY() AS TeamID;
      `);
    
    const newId = result.recordset[0].TeamID;
    console.log('📊 Repository: Created team with ID:', newId);
    
    return await getTeamById(newId);
  } catch (error) {
    console.error("TeamRepo Error [createTeam]:", error);
    throw error;
  }
}

// =======================
// Update an existing team
// =======================
async function updateTeam(teamId, teamData) {
  if (!teamId) throw new Error("teamId is required");
  const { TeamName, ManagerID, Active } = teamData;
  
  if (!TeamName) throw new Error("TeamName is required");
  if (ManagerID === undefined) throw new Error("ManagerID is required");

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("TeamID", sql.Int, teamId)
      .input("TeamName", sql.VarChar(100), TeamName)
      .input("ManagerID", sql.Int, ManagerID)
      .input("Active", sql.Bit, Active ?? 1)
      .query(`
        UPDATE dbo.Team
        SET TeamName = @TeamName,
            ManagerID = @ManagerID,
            Active = @Active
        WHERE TeamID = @TeamID
      `);
    
    return await getTeamById(teamId);
  } catch (error) {
    console.error("TeamRepo Error [updateTeam]:", error);
    throw error;
  }
}

// =======================
// Deactivate team
// =======================
async function deactivateTeam(teamId) {
  if (!teamId) throw new Error("teamId is required");
  
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("TeamID", sql.Int, teamId)
      .query(`
        UPDATE dbo.Team
        SET Active = 0 
        WHERE TeamID = @TeamID AND Active = 1;
        SELECT @@ROWCOUNT AS RowsAffected;
      `);
    return result.recordset[0]?.RowsAffected > 0;
  } catch (error) {
    console.error("TeamRepo Error [deactivateTeam]:", error);
    throw error;
  }
}

// =======================
// Reactivate team
// =======================
async function reactivateTeam(teamId) {
  if (!teamId) throw new Error("teamId is required");
  
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("TeamID", sql.Int, teamId)
      .query(`
        UPDATE dbo.Team
        SET Active = 1 
        WHERE TeamID = @TeamID AND Active = 0;
        SELECT @@ROWCOUNT AS RowsAffected;
      `);
    return result.recordset[0]?.RowsAffected > 0;
  } catch (error) {
    console.error("TeamRepo Error [reactivateTeam]:", error);
    throw error;
  }
}

// =======================
// Hard delete team
// =======================
async function deleteTeam(teamId) {
  if (!teamId) throw new Error("teamId is required");

  const pool = await sql.connect(dbConfig);
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    // Delete all team members first
    await new sql.Request(transaction)
      .input("TeamID", sql.Int, teamId)
      .query("DELETE FROM dbo.TeamMember WHERE TeamID = @TeamID");

    // Delete the team
    const result = await new sql.Request(transaction)
      .input("TeamID", sql.Int, teamId)
      .query(`
        DELETE FROM dbo.Team WHERE TeamID = @TeamID;
        SELECT @@ROWCOUNT AS RowsAffected;
      `);

    await transaction.commit();
    return result.recordset[0]?.RowsAffected > 0;
  } catch (error) {
    await transaction.rollback();
    console.error("TeamRepo Error [deleteTeam]:", error);
    throw error;
  }
}

// =======================
// TEAM MEMBER OPERATIONS
// =======================

async function getTeamMembers(teamId) {
  if (!teamId) throw new Error("teamId is required");
  
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("TeamID", sql.Int, teamId)
      .query(`
        SELECT 
          tm.TeamMemberID,
          tm.TeamID,
          tm.UserID,
          tm.JoinedAt,
          tm.Active,
          u.Username AS UserName,
          u.Email AS UserEmail,
          e.EmployeeID,
          e.EmployeeName,
          e.EmployeeEmail,
          e.EmployeePhone,
          e.DepartmentID AS EmployeeDepartmentID,
          e.JobTitleID
        FROM dbo.TeamMember tm
        INNER JOIN dbo.Users u ON tm.UserID = u.UserID
        LEFT JOIN dbo.Employee e ON u.UserID = e.UserID
        WHERE tm.TeamID = @TeamID
        ORDER BY tm.JoinedAt DESC
      `);
    return result.recordset;
  } catch (error) {
    console.error("TeamRepo Error [getTeamMembers]:", error);
    throw error;
  }
}

// Get all available employees (not in team)
async function getAvailableUsers(teamId) {
  if (!teamId) throw new Error("teamId is required");
  
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("TeamID", sql.Int, teamId)
      .query(`
        SELECT DISTINCT
          u.UserID
        FROM dbo.Users u
        WHERE u.Active = 1
        AND u.UserID NOT IN (
          SELECT UserID 
          FROM dbo.TeamMember 
          WHERE TeamID = @TeamID
        )
        ORDER BY u.UserID
      `);
    return result.recordset;
  } catch (error) {
    console.error("TeamRepo Error [getAvailableUsers]:", error);
    throw error;
  }
}

// Add employee to team
async function addTeamMember(teamId, userId) {
  if (!teamId) throw new Error("teamId is required");
  if (!userId) throw new Error("userId is required");

  try {
    const isMember = await isUserInTeam(teamId, userId);
    if (isMember) {
      throw new Error("User is already a member of this team");
    }

    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("TeamID", sql.Int, teamId)
      .input("UserID", sql.Int, userId)
      .query(`
        INSERT INTO dbo.TeamMember (TeamID, UserID, JoinedAt, Active)
        VALUES (@TeamID, @UserID, GETDATE(), 1);
        SELECT SCOPE_IDENTITY() AS TeamMemberID;
      `);
    return result.recordset[0]?.TeamMemberID;
  } catch (error) {
    console.error("TeamRepo Error [addTeamMember]:", error);
    throw error;
  }
}

// Remove employee from team
async function removeTeamMember(teamId, userId) {
  if (!teamId) throw new Error("teamId is required");
  if (!userId) throw new Error("userId is required");

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("TeamID", sql.Int, teamId)
      .input("UserID", sql.Int, userId)
      .query(`
        DELETE FROM dbo.TeamMember 
        WHERE TeamID = @TeamID AND UserID = @UserID;
        SELECT @@ROWCOUNT AS RowsAffected;
      `);
    return result.recordset[0]?.RowsAffected > 0;
  } catch (error) {
    console.error("TeamRepo Error [removeTeamMember]:", error);
    throw error;
  }
}

// Check if user is in team
async function isUserInTeam(teamId, userId) {
  if (!teamId) throw new Error("teamId is required");
  if (!userId) throw new Error("userId is required");
  
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("TeamID", sql.Int, teamId)
      .input("UserID", sql.Int, userId)
      .query(`
        SELECT COUNT(1) AS Count
        FROM dbo.TeamMember 
        WHERE TeamID = @TeamID AND UserID = @UserID
      `);
    return result.recordset[0].Count > 0;
  } catch (error) {
    console.error("TeamRepo Error [isUserInTeam]:", error);
    throw error;
  }
}

// =======================
// Get team by manager ID
// =======================
async function getTeamByManagerId(managerId) {
  if (!managerId) throw new Error("managerId is required");
  
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("ManagerID", sql.Int, managerId)
      .query(`
        SELECT 
          TeamID,
          TeamName,
          ManagerID,
          Active,
          CreatedAt
        FROM dbo.Team
        WHERE ManagerID = @ManagerID AND Active = 1
      `);
    return result.recordset[0] || null;
  } catch (error) {
    console.error("TeamRepo Error [getTeamByManagerId]:", error);
    throw error;
  }
}

// =======================
// Get all user IDs in a team (including manager)
// =======================
async function getTeamMemberUserIds(teamId) {
  if (!teamId) throw new Error("teamId is required");
  
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("TeamID", sql.Int, teamId)
      .query(`
        SELECT DISTINCT UserID
        FROM dbo.TeamMember
        WHERE TeamID = @TeamID AND Active = 1
        
        UNION
        
        SELECT ManagerID as UserID
        FROM dbo.Team
        WHERE TeamID = @TeamID AND Active = 1
      `);
    return result.recordset.map(row => row.UserID);
  } catch (error) {
    console.error("TeamRepo Error [getTeamMemberUserIds]:", error);
    throw error;
  }
}

// =======================
// Get employee IDs for team members
// =======================
async function getTeamMemberEmployeeIds(teamId) {
  if (!teamId) throw new Error("teamId is required");
  
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("TeamID", sql.Int, teamId)
      .query(`
        SELECT DISTINCT e.EmployeeID, e.EmployeeName, e.UserID
        FROM dbo.Employee e
        WHERE e.Active = 1
        AND e.UserID IN (
          SELECT UserID 
          FROM dbo.TeamMember 
          WHERE TeamID = @TeamID AND Active = 1
          
          UNION
          
          SELECT ManagerID
          FROM dbo.Team
          WHERE TeamID = @TeamID AND Active = 1
        )
        ORDER BY e.EmployeeName
      `);
    return result.recordset;
  } catch (error) {
    console.error("TeamRepo Error [getTeamMemberEmployeeIds]:", error);
    throw error;
  }
}

// Export these new functions
module.exports = {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deactivateTeam,
  reactivateTeam,
  deleteTeam,
  getTeamMembers,
  getAvailableUsers,
  addTeamMember,
  removeTeamMember,
  isUserInTeam,
  getTeamByManagerId,           
  getTeamMemberUserIds,         
  getTeamMemberEmployeeIds      
};