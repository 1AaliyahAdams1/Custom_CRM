const sql = require("mssql");
const dbConfig = require("../dbConfig");

// =======================
// Get all entity types
// =======================
async function getAllEntityTypes() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().query(`
    SELECT * FROM EntityType ORDER BY TypeName
  `);
  return result.recordset;
}

// =======================
// Create entity type
// =======================
async function createEntityType(typeName) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("TypeName", sql.VarChar(100), typeName)
    .query(`INSERT INTO EntityType (TypeName) VALUES (@TypeName)`);
}

// =======================
// Update entity type
// =======================
async function updateEntityType(entityTypeId, typeName) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("EntityTypeID", sql.Int, entityTypeId)
    .input("TypeName", sql.VarChar(100), typeName)
    .query(`
      UPDATE EntityType
      SET TypeName = @TypeName
      WHERE EntityTypeID = @EntityTypeID
    `);
}

// =======================
// Delete entity type
// =======================
async function deleteEntityType(entityTypeId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("EntityTypeID", sql.Int, entityTypeId)
    .query("DELETE FROM EntityType WHERE EntityTypeID = @EntityTypeID");
}

//All stored procedures
//getAllEntityTypes
//getIDByEntityType
//getEntityTypeByID
//createEntityType
//updateEntityType
//deactivateEntityType
//reactivateEntityType
//deleteEntityType

// =======================
// Exports
// =======================
module.exports = {
  getAllEntityTypes,
  createEntityType,
  updateEntityType,
  deleteEntityType,
};
