const sql = require("mssql");
const { dbConfig } = require("../../dbConfig");

// =======================
// Get user by Email or Username
// =======================
async function getUserByEmailOrUsername(identifier) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("Identifier", sql.VarChar(255), identifier)
      .query(`
        SELECT 
          u.*,
          -- Aggregate all active role names for this user into a CSV string
          STUFF((
            SELECT ',' + r.RoleName
            FROM UserRole ur
            JOIN Roles r ON ur.RoleID = r.RoleID
            WHERE ur.UserID = u.UserID AND ur.Active = 1
            FOR XML PATH(''), TYPE
          ).value('.', 'NVARCHAR(MAX)'), 1, 1, '') AS RoleNames
        FROM Users u
        WHERE (u.Email = @Identifier OR u.Username = @Identifier) AND u.Active = 1
      `);

    return result.recordset[0] || null;
  } catch (error) {
    console.error("User Repo Error [getUserByEmailOrUsername]:", error);
    throw error;
  }
}

//======================================
// Exports
//======================================
module.exports = {
getUserByEmailOrUsername,
};