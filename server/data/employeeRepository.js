const sql = require("mssql");
const dbConfig = require("../dbConfig");

// =======================
// Get all active employees with joins
// =======================
async function getAllEmployees() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().execute("GetEmployee");
    return result.recordset;
  } catch (error) {
    console.error("EmployeeRepo Error [getAllEmployees]:", error);
    throw error;
  }
}

// =======================
// Get employee by ID with joins
// =======================
async function getEmployeeById(employeeId) {
  if (!employeeId) throw new Error("employeeId is required");
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("EmployeeID", sql.Int, employeeId)
      .execute("GetEmployeeByID");
    return result.recordset[0] || null;
  } catch (error) {
    console.error("EmployeeRepo Error [getEmployeeById]:", error);
    throw error;
  }
}

// =======================
// Create a new employee
// =======================
async function createEmployee(data, changedBy, actionTypeId) {
  const {
    EmployeeName, EmployeeEmail, EmployeePhone,
    CityID, StateProvinceID, HireDate, TerminationDate,
    DepartmentID, salary, Holidays_PA, JobTitleID,
    UserID, TeamID, Active = 1
  } = data;

  if (!EmployeeName) throw new Error("EmployeeName is required");
  if (!changedBy) throw new Error("changedBy user ID is required");
  if (!actionTypeId) throw new Error("actionTypeId is required");

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("EmployeeID", sql.Int, 0)
      .input("EmployeeName", sql.NVarChar(100), EmployeeName)
      .input("EmployeeEmail", sql.VarChar(255), EmployeeEmail)
      .input("EmployeePhone", sql.VarChar(255), EmployeePhone)
      .input("CityID", sql.Int, CityID)
      .input("StateProvinceID", sql.Int, StateProvinceID)
      .input("HireDate", sql.Date, HireDate)
      .input("TerminationDate", sql.Date, TerminationDate)
      .input("DepartmentID", sql.Int, DepartmentID)
      .input("Salary", sql.Decimal(18, 0), salary)
      .input("Holidays_PA", sql.Int, Holidays_PA)
      .input("JobTitleID", sql.Int, JobTitleID)
      .input("UserID", sql.Int, UserID)
      .input("TeamID", sql.Int, TeamID)
      .input("Active", sql.Bit, Active)
      .input("ChangedBy", sql.Int, changedBy)
      .input("ActionTypeID", sql.Int, actionTypeId)
      .execute("CreateEmployee");
  } catch (error) {
    console.error("EmployeeRepo Error [createEmployee]:", error);
    throw error;
  }
}

// =======================
// Update an existing employee 
// =======================
async function updateEmployee(employeeId, updates, changedBy, actionTypeId) {
  if (!employeeId) throw new Error("employeeId is required");
  if (!changedBy) throw new Error("changedBy user ID is required");
  if (!actionTypeId) throw new Error("actionTypeId is required");

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("EmployeeID", sql.Int, employeeId)
      .input("EmployeeName", sql.NVarChar(100), updates.EmployeeName)
      .input("EmployeeEmail", sql.VarChar(255), updates.EmployeeEmail)
      .input("EmployeePhone", sql.VarChar(255), updates.EmployeePhone)
      .input("CityID", sql.Int, updates.CityID)
      .input("StateProvinceID", sql.Int, updates.StateProvinceID)
      .input("HireDate", sql.Date, updates.HireDate)
      .input("TerminationDate", sql.Date, updates.TerminationDate)
      .input("DepartmentID", sql.Int, updates.DepartmentID)
      .input("Salary", sql.Decimal(18, 0), updates.salary)
      .input("Holidays_PA", sql.Int, updates.Holidays_PA)
      .input("JobTitleID", sql.Int, updates.JobTitleID)
      .input("UserID", sql.Int, updates.UserID)
      .input("TeamID", sql.Int, updates.TeamID)
      .input("Active", sql.Bit, updates.Active)
      .input("ChangedBy", sql.Int, changedBy)
      .input("ActionTypeID", sql.Int, actionTypeId)
      .execute("UpdateEmployee");
  } catch (error) {
    console.error("EmployeeRepo Error [updateEmployee]:", error);
    throw error;
  }
}

// =======================
// Deactivate employee 
// =======================
async function deactivateEmployee(employee, changedBy, actionTypeId) {
  if (!employee || !employee.EmployeeID) throw new Error("employee with EmployeeID is required");
  if (!changedBy) throw new Error("changedBy user ID is required");
  if (!actionTypeId) throw new Error("actionTypeId is required");

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("EmployeeID", sql.Int, employee.EmployeeID)
      .input("EmployeeName", sql.NVarChar(100), employee.EmployeeName)
      .input("EmployeeEmail", sql.VarChar(255), employee.EmployeeEmail)
      .input("EmployeePhone", sql.VarChar(255), employee.EmployeePhone)
      .input("CityID", sql.Int, employee.CityID)
      .input("StateProvinceID", sql.Int, employee.StateProvinceID)
      .input("HireDate", sql.Date, employee.HireDate)
      .input("TerminationDate", sql.Date, employee.TerminationDate)
      .input("DepartmentID", sql.Int, employee.DepartmentID)
      .input("Salary", sql.Decimal(18, 0), employee.salary)
      .input("Holidays_PA", sql.Int, employee.Holidays_PA)
      .input("JobTitleID", sql.Int, employee.JobTitleID)
      .input("UserID", sql.Int, employee.UserID)
      .input("TeamID", sql.Int, employee.TeamID)
      .input("Active", sql.Bit, employee.Active)
      .input("ChangedBy", sql.Int, changedBy)
      .input("ActionTypeID", sql.Int, actionTypeId)
      .execute("DeactivateEmployee");
  } catch (error) {
    console.error("EmployeeRepo Error [deactivateEmployee]:", error);
    throw error;
  }
}

// =======================
// Reactivate employee
// =======================
async function reactivateEmployee(employee, changedBy, actionTypeId) {
  if (!employee || !employee.EmployeeID) throw new Error("employee with EmployeeID is required");
  if (!changedBy) throw new Error("changedBy user ID is required");
  if (!actionTypeId) throw new Error("actionTypeId is required");

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("EmployeeID", sql.Int, employee.EmployeeID)
      .input("EmployeeName", sql.NVarChar(100), employee.EmployeeName)
      .input("EmployeeEmail", sql.VarChar(255), employee.EmployeeEmail)
      .input("EmployeePhone", sql.VarChar(255), employee.EmployeePhone)
      .input("CityID", sql.Int, employee.CityID)
      .input("StateProvinceID", sql.Int, employee.StateProvinceID)
      .input("HireDate", sql.Date, employee.HireDate)
      .input("TerminationDate", sql.Date, employee.TerminationDate)
      .input("DepartmentID", sql.Int, employee.DepartmentID)
      .input("Salary", sql.Decimal(18, 0), employee.salary)
      .input("Holidays_PA", sql.Int, employee.Holidays_PA)
      .input("JobTitleID", sql.Int, employee.JobTitleID)
      .input("UserID", sql.Int, employee.UserID)
      .input("TeamID", sql.Int, employee.TeamID)
      .input("Active", sql.Bit, employee.Active)
      .input("ChangedBy", sql.Int, changedBy)
      .input("ActionTypeID", sql.Int, actionTypeId)
      .execute("ReactivateEmployee");
  } catch (error) {
    console.error("EmployeeRepo Error [reactivateEmployee]:", error);
    throw error;
  }
}

// =======================
// Hard delete employee
// =======================
async function deleteEmployee(employee, changedBy, actionTypeId) {
  if (!employee || !employee.EmployeeID) throw new Error("employee with EmployeeID is required");
  if (!changedBy) throw new Error("changedBy user ID is required");
  if (!actionTypeId) throw new Error("actionTypeId is required");

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("EmployeeID", sql.Int, employee.EmployeeID)
      .input("EmployeeName", sql.NVarChar(100), employee.EmployeeName)
      .input("EmployeeEmail", sql.VarChar(255), employee.EmployeeEmail)
      .input("EmployeePhone", sql.VarChar(255), employee.EmployeePhone)
      .input("CityID", sql.Int, employee.CityID)
      .input("StateProvinceID", sql.Int, employee.StateProvinceID)
      .input("HireDate", sql.Date, employee.HireDate)
      .input("TerminationDate", sql.Date, employee.TerminationDate)
      .input("DepartmentID", sql.Int, employee.DepartmentID)
      .input("Salary", sql.Decimal(18, 0), employee.salary)
      .input("Holidays_PA", sql.Int, employee.Holidays_PA)
      .input("JobTitleID", sql.Int, employee.JobTitleID)
      .input("UserID", sql.Int, employee.UserID)
      .input("TeamID", sql.Int, employee.TeamID)
      .input("Active", sql.Bit, employee.Active)
      .input("ChangedBy", sql.Int, changedBy)
      .input("ActionTypeID", sql.Int, actionTypeId)
      .execute("DeleteEmployee");
  } catch (error) {
    console.error("EmployeeRepo Error [deleteEmployee]:", error);
    throw error;
  }
}


// =======================
// Get employee by UserID
// =======================
async function getEmployeeByUserId(userId) {
  if (!userId) throw new Error("userId is required");

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("UserID", sql.Int, userId)
      .query(`
        SELECT TOP 1 *
        FROM Employee
        WHERE UserID = @UserID
      `);
    return result.recordset[0] || null;
  } catch (error) {
    console.error("EmployeeRepo Error [getEmployeeByUserId]:", error);
    throw error;
  }
}

// =======================
// Get UserID by EmployeeID
// =======================
async function getUserIdByEmployeeId(employeeId) {
  if (!employeeId) throw new Error("employeeId is required");

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("EmployeeID", sql.Int, employeeId)
      .query(`
        SELECT TOP 1 UserID
        FROM Employee
        WHERE EmployeeID = @EmployeeID
      `);
    return result.recordset[0]?.UserID || null;
  } catch (error) {
    console.error("EmployeeRepo Error [getUserIdByEmployeeId]:", error);
    throw error;
  }
}

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deactivateEmployee,
  reactivateEmployee,
  deleteEmployee,
  getUserIdByEmployeeId,
  getEmployeeByUserId
};