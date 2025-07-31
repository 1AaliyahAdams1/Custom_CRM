const sql = require("mssql");
const dbConfig = require("../dbConfig");

// =======================
// Get all active entity types
// =======================
async function getAllEntityTypes() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().execute("getAllEntityTypes");
    return result.recordset;
  } catch (error) {
    console.error("EntityTypeRepo Error [getAllEntityTypes]:", error);
    throw error;
  }
}

// =======================
// Get entity type by ID
// =======================
async function getEntityTypeById(entityTypeId) {
  if (!entityTypeId) throw new Error("entityTypeId is required");
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("EntityTypeID", sql.Int, entityTypeId)
      .execute("getEntityTypeByID");
    return result.recordset[0] || null;
  } catch (error) {
    console.error("EntityTypeRepo Error [getEntityTypeById]:", error);
    throw error;
  }
}

// =======================
// Create new entity type
// =======================
async function createEntityType(typeName) {
  if (!typeName) throw new Error("typeName is required");
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("TypeName", sql.VarChar(100), typeName)
      .execute("createEntityType");
  } catch (error) {
    console.error("EntityTypeRepo Error [createEntityType]:", error);
    throw error;
  }
}

// =======================
// Update entity type
// =======================
async function updateEntityType(entityTypeId, typeName) {
  if (!entityTypeId) throw new Error("entityTypeId is required");
  if (!typeName) throw new Error("typeName is required");
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("EntityTypeID", sql.Int, entityTypeId)
      .input("TypeName", sql.VarChar(100), typeName)
      .execute("updateEntityType");
  } catch (error) {
    console.error("EntityTypeRepo Error [updateEntityType]:", error);
    throw error;
  }
}

// =======================
// Deactivate entity type 
// =======================
async function deactivateEntityType(entityTypeId) {
  if (!entityTypeId) throw new Error("entityTypeId is required");
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("EntityTypeID", sql.Int, entityTypeId)
      .execute("deactivateEntityType");
  } catch (error) {
    console.error("EntityTypeRepo Error [deactivateEntityType]:", error);
    throw error;
  }
}

// =======================
// Reactivate entity type
// =======================
async function reactivateEntityType(entityTypeId) {
  if (!entityTypeId) throw new Error("entityTypeId is required");
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("EntityTypeID", sql.Int, entityTypeId)
      .execute("reactivateEntityType");
  } catch (error) {
    console.error("EntityTypeRepo Error [reactivateEntityType]:", error);
    throw error;
  }
}

// =======================
// Delete entity type
// =======================
async function deleteEntityType(entityTypeId) {
  if (!entityTypeId) throw new Error("entityTypeId is required");
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("EntityTypeID", sql.Int, entityTypeId)
      .execute("deleteEntityType");
  } catch (error) {
    console.error("EntityTypeRepo Error [deleteEntityType]:", error);
    throw error;
  }
}

module.exports = {
  getAllEntityTypes,
  getEntityTypeById,
  createEntityType,
  updateEntityType,
  deactivateEntityType,
  reactivateEntityType,
  deleteEntityType,
};
