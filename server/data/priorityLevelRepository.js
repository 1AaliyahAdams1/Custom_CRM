const sql = require("mssql");
const dbConfig = require("../dbConfig");

// =======================
// Get all priority levels ordered by PriorityLevelValue
// =======================
async function getAllPriorityLevels() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().execute("getAllPriorityLevels");
  return result.recordset;
}

// =======================
// Get priority level by ID
// =======================
async function getPriorityLevelById(id) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("PriorityLevelID", sql.Int, id)
    .execute("getPriorityLevelByID");
  return result.recordset[0];
}

// =======================
// Create a new priority level
// =======================
async function createPriorityLevel(data) {
  let pool;
  try {
    const { PriorityLevelName, PriorityLevelValue } = data;
    
    // Validate required fields
    if (!PriorityLevelName || PriorityLevelName.trim() === '') {
      throw new Error('PriorityLevelName is required');
    }
    
    if (PriorityLevelValue === undefined || PriorityLevelValue === null) {
      throw new Error('PriorityLevelValue is required');
    }
    
    console.log('Creating priority level with data:', { PriorityLevelName, PriorityLevelValue });
    
    // Get or create connection pool
    pool = await sql.connect(dbConfig);
    
    const result = await pool.request()
      .input("PriorityLevelName", sql.VarChar(100), PriorityLevelName)
      .input("PriorityLevelValue", sql.TinyInt, PriorityLevelValue)
      .query(`
        INSERT INTO PriorityLevel (PriorityLevelName, PriorityLevelValue)
        VALUES (@PriorityLevelName, @PriorityLevelValue);
        
        SELECT SCOPE_IDENTITY() AS PriorityLevelID;
      `);
    
    console.log('Priority level created successfully:', result.recordset);
    
    return { 
      message: "Priority level created",
      priorityLevelId: result.recordset[0].PriorityLevelID
    };
  } catch (error) {
    console.error('Error creating priority level:', error);
    
    // If connection error, try to close and reconnect
    if (error.code === 'ETIMEOUT' || error.code === 'ECONNRESET') {
      try {
        await sql.close();
      } catch (closeError) {
        console.error('Error closing connection:', closeError);
      }
    }
    
    throw error;
  }
}
// =======================
// Update an existing priority level
// =======================
async function updatePriorityLevel(id, data) {
  const { PriorityLevelName, PriorityLevelValue } = data;
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("PriorityLevelID", sql.Int, id)
    .input("PriorityLevelName", sql.VarChar(100), PriorityLevelName)
    .input("PriorityLevelValue", sql.TinyInt, PriorityLevelValue)
    .execute("updatePriorityLevel");
  return { message: "Priority level updated", PriorityLevelID: id };
}

// =======================
// Deactivate a priority level
// =======================
async function deactivatePriorityLevel(id) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("PriorityLevelID", sql.Int, id)
    .execute("deactivatePriorityLevel");
  return { message: "Priority level deactivated", PriorityLevelID: id };
}

// =======================
// Reactivate a priority level
// =======================
async function reactivatePriorityLevel(id) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("PriorityLevelID", sql.Int, id)
    .execute("reactivatePriorityLevel");
  return { message: "Priority level reactivated", PriorityLevelID: id };
}

// =======================
// Delete a priority level
// =======================
async function deletePriorityLevel(id) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("PriorityLevelID", sql.Int, id)
    .execute("deletePriorityLevel");
  return { message: "Priority level deleted", PriorityLevelID: id };
}

// =======================
// Exports
// =======================
module.exports = {
  getAllPriorityLevels,
  getPriorityLevelById,
  createPriorityLevel,
  updatePriorityLevel,
  deactivatePriorityLevel,
  reactivatePriorityLevel,
  deletePriorityLevel,
};
