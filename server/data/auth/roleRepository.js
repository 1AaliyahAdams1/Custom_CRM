const sql = require("mssql");
const { dbConfig } = require("../../dbConfig"); // adjust path as needed

async function getUserRoles(userId) {
  try {
    const pool = await dbConfig;
    const result = await pool.request()
      .input("UserID", sql.Int, userId)
      .query(`
        SELECT R.RoleName
        FROM Users U
        JOIN UserRole UR ON U.UserID = UR.UserID AND UR.Active = 1
        JOIN Roles R ON UR.RoleID = R.RoleID AND R.Active = 1
        WHERE U.UserID = @UserID
      `);

    // return an array of role names, e.g. ['C-level', 'Sales Manager']
    return result.recordset.map(row => row.RoleName);
  } catch (error) {
    console.error("Error fetching user roles:", error);
    throw error;
  }
}

module.exports = {
  getUserRoles,
};
