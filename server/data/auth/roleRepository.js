const sql = require("mssql");
const { dbConfig } = require("../../dbConfig");

async function getUserRoles(userId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("UserID", sql.Int, userId)
      .execute("GetUserRoles");

    return result.recordset.map(row => row.RoleName);
  } catch (error) {
    console.error("Error fetching user roles:", error);
    throw error;
  }
}

module.exports = {
  getUserRoles,
};
