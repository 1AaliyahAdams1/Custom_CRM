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
      .execute("GetUserByEmailOrUsername");
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