const sql = require("mssql");
const { dbConfig } = require("../../dbConfig");

async function getUserRoles(userId) {
  try {
    console.log("=== getUserRoles Backend Debug ===");
    console.log("UserID received:", userId);
    
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("UserID", sql.Int, userId)
      .query(`
        SELECT R.RoleName
        FROM Users U
        JOIN UserRole UR ON U.UserID = UR.UserID AND UR.Active = 1
        JOIN Roles R ON UR.RoleID = R.RoleID AND R.Active = 1
        WHERE U.UserID = @UserID AND U.Active = 1
      `);

    console.log("SQL Query result:", result.recordset);
    
    const roles = result.recordset.map(row => row.RoleName);
    console.log("Mapped roles:", roles);
    
    return roles;
  } catch (error) {
    console.error("Error fetching user roles:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      state: error.state
    });
    throw error;
  }
}

module.exports = {
  getUserRoles,
};