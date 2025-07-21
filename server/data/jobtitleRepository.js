const sql = require("mssql");
const { dbConfig } = require("../dbConfig");


// =======================
// Get all job titles
// =======================
async function getAllJobTitles(activeOnly = false) {
  const pool = await sql.connect(dbConfig);
  const query = `
    SELECT JobTitleID, JobTitleName, Active
    FROM JobTitle
    ORDER BY JobTitleName
  `;
  const result = await pool.request().query(query);
  return result.recordset;
}

// =======================
// Get a single job title by ID
// =======================
async function getJobTitleById(jobTitleId) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("JobTitleID", sql.SmallInt, jobTitleId)
    .query(`
      SELECT JobTitleID, JobTitleName, Active
      FROM JobTitle
      WHERE JobTitleID = @JobTitleID
    `);
  return result.recordset[0];
}

// =======================
// Create a new job title
// =======================
async function createJobTitle(jobTitleName, active = true) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("JobTitleName", sql.NVarChar(100), jobTitleName)
    .input("Active", sql.Bit, active)
    .query(`
      INSERT INTO JobTitle (JobTitleName, Active)
      VALUES (@JobTitleName, @Active);
      SELECT SCOPE_IDENTITY() AS JobTitleID;
    `);
  return result.recordset[0];
}

// =======================
// Update an existing job title
// =======================
async function updateJobTitle(jobTitleId, data) {
  const { JobTitleName, Active } = data;
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("JobTitleID", sql.SmallInt, jobTitleId)
    .input("JobTitleName", sql.NVarChar(100), JobTitleName)
    .input("Active", sql.Bit, Active)
    .query(`
      UPDATE JobTitle
      SET JobTitleName = @JobTitleName,
          Active = @Active
      WHERE JobTitleID = @JobTitleID;
    `);
}

// =======================
// Soft delete: mark job title as inactive
// =======================
async function deleteJobTitle(jobTitleId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("JobTitleID", sql.SmallInt, jobTitleId)
    .query(`
      UPDATE JobTitle
      SET Active = 0
      WHERE JobTitleID = @JobTitleID;
    `);
}

// =======================
// Exports
// =======================
module.exports = {
  getAllJobTitles,
  getJobTitleById,
  createJobTitle,
  updateJobTitle,
  deleteJobTitle,
};
