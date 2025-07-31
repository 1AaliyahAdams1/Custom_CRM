const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

// =======================
// Get all active departments
// =======================
async function getAllDepartments() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().execute("GetDepartment");
    return result.recordset.filter(dept => dept.Active === 1);
  } catch (error) {
    console.error("DepartmentRepo Error [getAllDepartments]:", error);
    throw error;
  }
}

// =======================
// Get department by ID
// =======================
async function getDepartmentById(departmentId) {
  if (!departmentId) throw new Error("departmentId is required");
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("DepartmentID", sql.Int, departmentId)
      .execute("GetDepartmentByID");
    return result.recordset[0] || null;
  } catch (error) {
    console.error("DepartmentRepo Error [getDepartmentById]:", error);
    throw error;
  }
}

// =======================
// Create new department
// =======================
async function createDepartment(departmentName) {
  if (!departmentName) throw new Error("departmentName is required");
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("DepartmentName", sql.VarChar(255), departmentName)
      .execute("CreateDepartment");
  } catch (error) {
    console.error("DepartmentRepo Error [createDepartment]:", error);
    throw error;
  }
}

// =======================
// Update department name
// =======================
async function updateDepartment(departmentId, departmentName) {
  if (!departmentId) throw new Error("departmentId is required");
  if (!departmentName) throw new Error("departmentName is required");
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("DepartmentID", sql.Int, departmentId)
      .input("DepartmentName", sql.VarChar(255), departmentName)
      .execute("UpdateDepartment");
  } catch (error) {
    console.error("DepartmentRepo Error [updateDepartment]:", error);
    throw error;
  }
}

// =======================
// Deactivate department
// =======================
async function deactivateDepartment(departmentId) {
  if (!departmentId) throw new Error("departmentId is required");
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("DepartmentID", sql.Int, departmentId)
      .execute("DeactivateDepartment");
  } catch (error) {
    console.error("DepartmentRepo Error [deactivateDepartment]:", error);
    throw error;
  }
}

// =======================
// Reactivate department
// =======================
async function reactivateDepartment(departmentId) {
  if (!departmentId) throw new Error("departmentId is required");
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("DepartmentID", sql.Int, departmentId)
      .execute("ReactivateDepartment");
  } catch (error) {
    console.error("DepartmentRepo Error [reactivateDepartment]:", error);
    throw error;
  }
}

// =======================
// Hard delete department 
// =======================
async function deleteDepartment(departmentId) {
  if (!departmentId) throw new Error("departmentId is required");
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("DepartmentID", sql.Int, departmentId)
      .execute("DeleteDepartment");
  } catch (error) {
    console.error("DepartmentRepo Error [deleteDepartment]:", error);
    throw error;
  }
}

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deactivateDepartment,
  reactivateDepartment,
  deleteDepartment,
};