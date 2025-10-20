<<<<<<< HEAD
const departmentRepository = require('../data/departmentRepository');
//======================================
// Get all departments
//======================================
async function getAllDepartments() {
    return await departmentRepository.getAllDepartments();
}
//======================================
// Get department by ID
//======================================
async function getDepartmentById(departmentId) {
    return await departmentRepository.getDepartmentById(departmentId);
}
//======================================
// Create a new department
//======================================
async function createDepartment(departmentName) {
    return await departmentRepository.createDepartment(departmentName);
}
//======================================
// Update an existing department
//======================================
async function updateDepartment(departmentId, departmentName) {
    return await departmentRepository.updateDepartment(departmentId, departmentName);
}
//======================================
// Deactivate a department
//======================================
async function deactivateDepartment(departmentId) {
    return await departmentRepository.deactivateDepartment(departmentId);
}
//======================================
// Reactivate a department
//======================================
async function reactivateDepartment(departmentId) {
    return await departmentRepository.reactivateDepartment(departmentId);
}
//======================================
// Exports
//======================================
module.exports = {
    getAllDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deactivateDepartment,
    reactivateDepartment
};
=======
const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

class DepartmentService {
  // Get all departments
  static async getAllDepartments() {
    try {
      console.log("🟢 DepartmentService: Fetching all departments...");
      const pool = await sql.connect(dbConfig);
      const result = await pool.request().query(`
        SELECT 
          DepartmentID,
          DepartmentName,
          Active
        FROM dbo.Department
        WHERE Active = 1
        ORDER BY DepartmentName ASC
      `);
      console.log("🟢 DepartmentService: Found", result.recordset.length, "departments");
      return result.recordset;
    } catch (error) {
      console.error("🔴 DepartmentService Error [getAllDepartments]:", error);
      throw error;
    }
  }

  // Get department by ID
  static async getDepartmentById(departmentId) {
    try {
      console.log("🟢 DepartmentService: Getting department by ID:", departmentId);
      const pool = await sql.connect(dbConfig);
      const result = await pool.request()
        .input("DepartmentID", sql.Int, departmentId)
        .query(`
          SELECT DepartmentID, DepartmentName, Active
          FROM dbo.Department
          WHERE DepartmentID = @DepartmentID
        `);
      const department = result.recordset[0] || null;
      console.log("🟢 DepartmentService: Department found:", department);
      return department;
    } catch (error) {
      console.error("🔴 DepartmentService Error [getDepartmentById]:", error);
      throw error;
    }
  }

  // Create new department - direct SQL with return
  static async createDepartment(data) {
    try {
      console.log("🟢 DepartmentService: Creating department with data:", data);
      
      if (!data || !data.DepartmentName || !data.DepartmentName.trim()) {
        throw new Error("DepartmentName is required");
      }

      const pool = await sql.connect(dbConfig);

      const insertResult = await pool.request()
        .input("DepartmentName", sql.VarChar(255), data.DepartmentName.trim())
        .input("Active", sql.Bit, data.Active !== false ? 1 : 0)
        .query(`
          INSERT INTO dbo.Department (DepartmentName, Active)
          VALUES (@DepartmentName, @Active);
          SELECT SCOPE_IDENTITY() as NewDepartmentID;
        `);

      const newDepartmentId = insertResult.recordset[0].NewDepartmentID;
      console.log("🟢 DepartmentService: Inserted department with ID:", newDepartmentId);

      const selectResult = await pool.request()
        .input("DepartmentID", sql.Int, newDepartmentId)
        .query(`
          SELECT DepartmentID, DepartmentName, Active
          FROM dbo.Department
          WHERE DepartmentID = @DepartmentID
        `);

      const newDepartment = selectResult.recordset[0];
      console.log("🟢 DepartmentService: Successfully created department:", newDepartment);

      return newDepartment;
    } catch (error) {
      console.error("🔴 DepartmentService Error [createDepartment]:", error);
      console.error("🔴 Error details:", { message: error.message, code: error.code, number: error.number });
      throw error;
    }
  }
}

module.exports = DepartmentService;
>>>>>>> ea839b4db07b3dad90afd56e3760b09b150ea2f7
