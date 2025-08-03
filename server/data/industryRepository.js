const sql = require("mssql");
const dbConfig = require("../dbConfig");

// =======================
// Get all active industries
// =======================
async function getAllIndustries() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().execute("getAllIndustries");
    return result.recordset;
  } catch (error) {
    console.error("DB error in getAllIndustries:", error);
    throw error;
  }
}

// =======================
// Get industry by ID
// =======================
async function getIndustryById(industryId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("IndustryID", sql.Int, industryId)
      .execute("getIndustryById");
    return result.recordset[0];
  } catch (error) {
    console.error("DB error in getIndustryById:", error);
    throw error;
  }
}

// =======================
// Create a new industry
// =======================
async function createIndustry(industryName) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("IndustryName", sql.VarChar(255), industryName)
      .execute("createIndustry");
  } catch (error) {
    console.error("DB error in createIndustry:", error);
    throw error;
  }
}

// =======================
// Update an industry
// =======================
async function updateIndustry(industryId, industryName) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("IndustryID", sql.Int, industryId)
      .input("IndustryName", sql.VarChar(255), industryName)
      .execute("updateIndustry");
  } catch (error) {
    console.error("DB error in updateIndustry:", error);
    throw error;
  }
}

// =======================
// Deactivate an industry
// =======================
async function deactivateIndustry(industryId) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("IndustryID", sql.Int, industryId)
      .execute("deactivateIndustry");
  } catch (error) {
    console.error("DB error in deactivateIndustry:", error);
    throw error;
  }
}

// =======================
// Reactivate an industry
// =======================
async function reactivateIndustry(industryId) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("IndustryID", sql.Int, industryId)
      .execute("reactivateIndustry");
  } catch (error) {
    console.error("DB error in reactivateIndustry:", error);
    throw error;
  }
}

// =======================
// Delete an industry 
// =======================
async function deleteIndustry(industryId) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("IndustryID", sql.Int, industryId)
      .execute("deleteIndustry");
  } catch (error) {
    console.error("DB error in deleteIndustry:", error);
    throw error;
  }
}

// =======================
// Exports
// =======================
module.exports = {
  getAllIndustries,
  getIndustryById,
  createIndustry,
  updateIndustry,
  deactivateIndustry,
  reactivateIndustry,
  deleteIndustry,
};
