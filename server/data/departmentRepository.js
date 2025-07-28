const sql = require("mssql");
const dbConfig = require("../dbConfig");

// =======================
// Get all active departments
// =======================
async function getAllDepartments() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().query(`
    SELECT * FROM Department
    WHERE Active = 1
    ORDER BY DepartmentName
  `);
  return result.recordset;
}

// =======================
// Get department by ID
// =======================
async function getDepartmentById(departmentId) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("DepartmentID", sql.Int, departmentId)
    .query("SELECT * FROM Department WHERE DepartmentID = @DepartmentID");
  return result.recordset[0];
}

// =======================
// Create new department
// =======================
async function createDepartment(departmentName) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("DepartmentName", sql.VarChar(255), departmentName)
    .query(`
      INSERT INTO Department (DepartmentName)
      VALUES (@DepartmentName)
    `);
}

// =======================
// Update department name
// =======================
async function updateDepartment(departmentId, departmentName) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("DepartmentID", sql.Int, departmentId)
    .input("DepartmentName", sql.VarChar(255), departmentName)
    .query(`
      UPDATE Department
      SET DepartmentName = @DepartmentName
      WHERE DepartmentID = @DepartmentID
    `);
}

// =======================
// Soft delete department
// =======================
async function deactivateDepartment(departmentId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("DepartmentID", sql.Int, departmentId)
    .query(`
      UPDATE Department
      SET Active = 0
      WHERE DepartmentID = @DepartmentID
    `);
}

// =======================
// Exports
// =======================
module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deactivateDepartment
};
