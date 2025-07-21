const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

// Get all activity types (ordered alphabetically)
async function getAllActivityTypes() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().query(`
    SELECT TypeID, TypeName, Description
    FROM ActivityType
    ORDER BY TypeName
  `);
  return result.recordset;
}

// Get a single activity type by ID
async function getActivityTypeById(id) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("TypeID", sql.SmallInt, id)
    .query("SELECT * FROM ActivityType WHERE TypeID = @TypeID");
  return result.recordset[0];
}

// Create a new activity type
async function createActivityType(data) {
  const { TypeName, Description = null } = data;
  const pool = await sql.connect(dbConfig);

  const result = await pool.request()
    .input("TypeName", sql.NVarChar(100), TypeName)
    .input("Description", sql.NVarChar(255), Description)
    .query(`
      INSERT INTO ActivityType (TypeName, Description, CreatedAt, UpdatedAt)
      VALUES (@TypeName, @Description, GETDATE(), GETDATE());
      SELECT SCOPE_IDENTITY() AS TypeID;
    `);

  return result.recordset[0];
}

// Update an existing activity type
async function updateActivityType(id, data) {
  const { TypeName, Description = null } = data;
  const pool = await sql.connect(dbConfig);

  await pool.request()
    .input("TypeID", sql.SmallInt, id)
    .input("TypeName", sql.NVarChar(100), TypeName)
    .input("Description", sql.NVarChar(255), Description)
    .query(`
      UPDATE ActivityType
      SET TypeName = @TypeName,
          Description = @Description,
          UpdatedAt = GETDATE()
      WHERE TypeID = @TypeID;
    `);
}

// Delete an activity type (hard delete)
async function deleteActivityType(id) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("TypeID", sql.SmallInt, id)
    .query("DELETE FROM ActivityType WHERE TypeID = @TypeID");
}

module.exports = {
  getAllActivityTypes,
  getActivityTypeById,
  createActivityType,
  updateActivityType,
  deleteActivityType,
};
