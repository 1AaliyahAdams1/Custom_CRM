const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

// ==========================================
// Get all priority levels ordered by PriorityLevelValue
// ==========================================
async function getAllPriorityLevels() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT PriorityLevelID, PriorityLevelName, PriorityLevelValue
      FROM PriorityLevel
      ORDER BY PriorityLevelValue
    `);
    return result.recordset;
  } catch (error) {
    console.error("PriorityLevel Repo Error [getAllPriorityLevels]:", error);
    throw error;
  }
}

// ==========================================
// Get priority level by ID
// ==========================================
async function getPriorityLevelById(id) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("PriorityLevelID", sql.Int, id)
      .query(`
        SELECT PriorityLevelID, PriorityLevelName, PriorityLevelValue
        FROM PriorityLevel
        WHERE PriorityLevelID = @PriorityLevelID
      `);
    return result.recordset[0];
  } catch (error) {
    console.error("PriorityLevel Repo Error [getPriorityLevelById]:", error);
    throw error;
  }
}

// ==========================================
// Create a new priority level
// ==========================================
async function createPriorityLevel(data) {
  try {
    const { PriorityLevelName, PriorityLevelValue } = data;
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("PriorityLevelName", sql.NVarChar(100), PriorityLevelName)
      .input("PriorityLevelValue", sql.Int, PriorityLevelValue)
      .query(`
        INSERT INTO PriorityLevel (PriorityLevelName, PriorityLevelValue)
        VALUES (@PriorityLevelName, @PriorityLevelValue);
        SELECT SCOPE_IDENTITY() AS PriorityLevelID;
      `);
    return result.recordset[0];
  } catch (error) {
    console.error("PriorityLevel Repo Error [createPriorityLevel]:", error);
    throw error;
  }
}

// ==========================================
// Update an existing priority level
// ==========================================
async function updatePriorityLevel(id, data) {
  try {
    const { PriorityLevelName, PriorityLevelValue } = data;
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("PriorityLevelID", sql.Int, id)
      .input("PriorityLevelName", sql.NVarChar(100), PriorityLevelName)
      .input("PriorityLevelValue", sql.Int, PriorityLevelValue)
      .query(`
        UPDATE PriorityLevel
        SET PriorityLevelName = @PriorityLevelName,
            PriorityLevelValue = @PriorityLevelValue
        WHERE PriorityLevelID = @PriorityLevelID
      `);
    return { message: "Priority level updated", PriorityLevelID: id };
  } catch (error) {
    console.error("PriorityLevel Repo Error [updatePriorityLevel]:", error);
    throw error;
  }
}

// ==========================================
// Delete priority level (hard delete)
// ==========================================
async function deletePriorityLevel(id) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("PriorityLevelID", sql.Int, id)
      .query("DELETE FROM PriorityLevel WHERE PriorityLevelID = @PriorityLevelID");
    return { message: "Priority level deleted", PriorityLevelID: id };
  } catch (error) {
    console.error("PriorityLevel Repo Error [deletePriorityLevel]:", error);
    throw error;
  }
}

//All stored procedures
//getAllPriorityLevels
//getPriorityLevelByID
//getIDByPriorityLevel
//createPriorityLevel
//updatePriorityLevel
//deactivatePriorityLevel
//reactivatePriorityLevel
//deletePriorityLevel

// =======================
// Exports
// =======================
module.exports = {
  getAllPriorityLevels,
  getPriorityLevelById,
  createPriorityLevel,
  updatePriorityLevel,
  deletePriorityLevel,
};
