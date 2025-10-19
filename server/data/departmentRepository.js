const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

// =======================
// Get all active departments
// =======================
async function getAllDepartments() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .query("SELECT * FROM Department WHERE Active = 1 ORDER BY DepartmentName");

    return result.recordset;
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
      .query("SELECT * FROM Department WHERE DepartmentID = @DepartmentID");
       
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
    
    // First, insert the department
    const insertResult = await pool.request()
      .input("DepartmentName", sql.VarChar(255), departmentName)
      .query(`
        INSERT INTO Department (DepartmentName, Active) 
        VALUES (@DepartmentName, 1);
        SELECT SCOPE_IDENTITY() AS DepartmentID;
      `);
    
    const newId = insertResult.recordset[0].DepartmentID;
    console.log('📊 Repository: Created department with ID:', newId);
    
    // Then fetch the created record
    const selectResult = await pool.request()
      .input("DepartmentID", sql.Int, newId)
      .query("SELECT * FROM Department WHERE DepartmentID = @DepartmentID");
    
    console.log('📊 Repository: Returning department:', selectResult.recordset[0]);
    return selectResult.recordset[0];
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
    const result = await pool.request()
      .input("DepartmentID", sql.Int, departmentId)
      .input("DepartmentName", sql.VarChar(255), departmentName)
      .query(`
        UPDATE Department
        SET DepartmentName = @DepartmentName 
        WHERE DepartmentID = @DepartmentID;
        SELECT * FROM Department WHERE DepartmentID = @DepartmentID;
      `);
    return result.recordset[0];
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
    const result = await pool.request()
      .input("DepartmentID", sql.Int, departmentId)
      .query(`
        UPDATE Department
        SET Active = 0 
        WHERE DepartmentID = @DepartmentID AND Active = 1;
        SELECT @@ROWCOUNT AS RowsAffected;
      `);
    return result.recordset[0]?.RowsAffected > 0;
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
    const result = await pool.request()
      .input("DepartmentID", sql.Int, departmentId)
      .query(`
        UPDATE Department
        SET Active = 1 
        WHERE DepartmentID = @DepartmentID AND Active = 0;
        SELECT @@ROWCOUNT AS RowsAffected;
      `);
    return result.recordset[0]?.RowsAffected > 0;
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
    const result = await pool.request()
      .input("DepartmentID", sql.Int, departmentId)
      .query(`
        DELETE FROM Department 
        WHERE DepartmentID = @DepartmentID;
        SELECT @@ROWCOUNT AS RowsAffected;
      `);
    return result.recordset[0]?.RowsAffected > 0;
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