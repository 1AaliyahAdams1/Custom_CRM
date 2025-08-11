const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

async function getAccountsForUser(userId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("UserID", sql.Int, userId)
      .execute("GetAccountsForUser");
    return result.recordset;
  } catch (err) {
    console.error("Database error in getAccountsForUser:", err);
    throw err;
  }
}

module.exports = {
  getAccountsForUser,
};
