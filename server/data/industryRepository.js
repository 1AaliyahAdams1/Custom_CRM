const sql = require("mssql");
const { dbConfig } = require("../dbConfig");


// =======================
// Get all industries
// =======================
async function getAllIndustries(activeOnly = false) {
  const pool = await sql.connect(dbConfig);
  const query = `
    SELECT IndustryID, IndustryName, Active
    FROM Industry
    ORDER BY IndustryName
  `;
  const result = await pool.request().query(query);
  return result.recordset;
}

// =======================
// Get an industry by ID
// =======================
async function getIndustryById(industryId) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("IndustryID", sql.Int, industryId)
    .query(`
      SELECT IndustryID, IndustryName, Active
      FROM Industry
      WHERE IndustryID = @IndustryID
    `);
  return result.recordset[0];
}

// =======================
// Create a new industry
// =======================
async function createIndustry(industryName, active = true) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("IndustryName", sql.NVarChar(100), industryName)
    .input("Active", sql.Bit, active)
    .query(`
      INSERT INTO Industry (IndustryName, Active)
      VALUES (@IndustryName, @Active);
      SELECT SCOPE_IDENTITY() AS IndustryID;
    `);
  return result.recordset[0];
}

// =======================
// Update an industry
// =======================
async function updateIndustry(industryId, data) {
  const { IndustryName, Active } = data;
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("IndustryID", sql.Int, industryId)
    .input("IndustryName", sql.NVarChar(100), IndustryName)
    .input("Active", sql.Bit, Active)
    .query(`
      UPDATE Industry
      SET IndustryName = @IndustryName,
          Active = @Active
      WHERE IndustryID = @IndustryID;
    `);
}

// =======================
// Soft delete: mark industry as inactive
// =======================
async function deleteIndustry(industryId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("IndustryID", sql.Int, industryId)
    .query(`
      UPDATE Industry
      SET Active = 0
      WHERE IndustryID = @IndustryID;
    `);
}


//All Stored procedures
//getAllIndustries
//getIndustryById
//getIDByIndustry
//createIndustry
//updateIndustry
//deactivateIndustry
//reactivateIndustry
//deleteIndustry



// =======================
// Exports
// =======================
module.exports = {
  getAllIndustries,
  getIndustryById,
  createIndustry,
  updateIndustry,
  deleteIndustry,
};
