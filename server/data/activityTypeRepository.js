const sql = require("mssql");
const dbConfig = require('../dbConfig'); // Your database connection configuration

// Get all activity types (sorted alphabetically)
const getAll = async () => {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().query(
    "SELECT TypeID, TypeName FROM ActivityType ORDER BY TypeName"
  );
  return result.recordset;
};

// Get a single activity type by ID
const getById = async (id) => {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("TypeID", sql.Int, id)
    .query("SELECT * FROM ActivityType WHERE TypeID = @TypeID");
  return result.recordset[0];
};

module.exports = {
  getAll,
  getById,
};
