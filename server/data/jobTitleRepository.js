const sql = require("mssql");
const dbConfig = require("../dbConfig");

// =======================
// Get all active job titles
// =======================
async function getAllJobTitles() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().execute("getAllJobTitles");
    return result.recordset;
  } catch (error) {
    console.error("DB error in getAllJobTitles:", error);
    throw error;
  }
}

// =======================
// Get a single job title by ID
// =======================
async function getJobTitleById(jobTitleId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("JobTitleID", sql.Int, jobTitleId)
      .execute("getJobTitleById");
    return result.recordset[0];
  } catch (error) {
    console.error("DB error in getJobTitleById:", error);
    throw error;
  }
}

// =======================
// Create a new job title
// =======================
async function createJobTitle(jobTitleName) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("JobTitleName", sql.VarChar(255), jobTitleName)
      .execute("createJobTitle");
  } catch (error) {
    console.error("DB error in createJobTitle:", error);
    throw error;
  }
}

// =======================
// Update an existing job title
// =======================
async function updateJobTitle(jobTitleId, jobTitleName) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("JobTitleID", sql.Int, jobTitleId)
      .input("JobTitleName", sql.VarChar(255), jobTitleName)
      .execute("updateJobTitle");
  } catch (error) {
    console.error("DB error in updateJobTitle:", error);
    throw error;
  }
}

// =======================
// Deactivate a job title
// =======================
async function deactivateJobTitle(jobTitleId) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("JobTitleID", sql.Int, jobTitleId)
      .execute("deactiveJobTitle");
  } catch (error) {
    console.error("DB error in deactivateJobTitle:", error);
    throw error;
  }
}

// =======================
// Reactivate a job title
// =======================
async function reactivateJobTitle(jobTitleId) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("JobTitleID", sql.Int, jobTitleId)
      .execute("reactivateJobTitle");
  } catch (error) {
    console.error("DB error in reactivateJobTitle:", error);
    throw error;
  }
}

// =======================
// Delete a job title
// =======================
async function deleteJobTitle(jobTitleId) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("JobTitleID", sql.Int, jobTitleId)
      .execute("deleteJobTitle");
  } catch (error) {
    console.error("DB error in deleteJobTitle:", error);
    throw error;
  }
}

// =======================
// Exports
// =======================
module.exports = {
  getAllJobTitles,
  getJobTitleById,
  createJobTitle,
  updateJobTitle,
  deactivateJobTitle,
  reactivateJobTitle,
  deleteJobTitle,
};