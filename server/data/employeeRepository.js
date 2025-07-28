const sql = require("mssql");
const dbConfig = require("../dbConfig");

// =======================
// Get all active employees (with joins)
// =======================
async function getAllEmployees() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().query(`
    SELECT 
      e.*, 
      u.Username, 
      jt.JobTitleName, 
      c.CityName, 
      sp.StateProvinceName,
      d.DepartmentName,
      t.TeamName
    FROM Employee e
    LEFT JOIN Users u ON e.UserID = u.UserID
    LEFT JOIN JobTitle jt ON e.JobTitleID = jt.JobTitleID
    LEFT JOIN City c ON e.CityID = c.CityID
    LEFT JOIN StateProvince sp ON e.StateProvinceID = sp.StateProvinceID
    LEFT JOIN Department d ON e.DepartmentID = d.DepartmentID
    LEFT JOIN Team t ON e.TeamID = t.TeamID
    WHERE e.Active = 1
    ORDER BY e.EmployeeName
  `);
  return result.recordset;
}

// =======================
// Get employee by ID
// =======================
async function getEmployeeById(employeeId) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("EmployeeID", sql.Int, employeeId)
    .query(`
      SELECT * FROM Employee WHERE EmployeeID = @EmployeeID
    `);
  return result.recordset[0];
}

// =======================
// Create a new employee
// =======================
async function createEmployee(data) {
  const {
    EmployeeName, EmployeeEmail, EmployeePhone,
    CityID, StateProvinceID, HireDate, TerminationDate,
    DepartmentID, salary, Holidays_PA, JobTitleID,
    UserID, TeamID, Active
  } = data;

  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("EmployeeName", sql.NVarChar(100), EmployeeName)
    .input("EmployeeEmail", sql.VarChar(255), EmployeeEmail)
    .input("EmployeePhone", sql.VarChar(255), EmployeePhone)
    .input("CityID", sql.Int, CityID)
    .input("StateProvinceID", sql.Int, StateProvinceID)
    .input("HireDate", sql.Date, HireDate)
    .input("TerminationDate", sql.Date, TerminationDate)
    .input("DepartmentID", sql.Int, DepartmentID)
    .input("salary", sql.Decimal(18, 2), salary)
    .input("Holidays_PA", sql.Int, Holidays_PA)
    .input("JobTitleID", sql.Int, JobTitleID)
    .input("UserID", sql.Int, UserID)
    .input("TeamID", sql.Int, TeamID)
    .input("Active", sql.Bit, Active ?? 1)
    .query(`
      INSERT INTO Employee (
        EmployeeName, EmployeeEmail, EmployeePhone,
        CityID, StateProvinceID, HireDate, TerminationDate,
        DepartmentID, salary, Holidays_PA, JobTitleID,
        UserID, TeamID, Active, CreatedAt
      ) VALUES (
        @EmployeeName, @EmployeeEmail, @EmployeePhone,
        @CityID, @StateProvinceID, @HireDate, @TerminationDate,
        @DepartmentID, @salary, @Holidays_PA, @JobTitleID,
        @UserID, @TeamID, @Active, GETDATE()
      )
    `);
}

// =======================
// Update an existing employee
// =======================
async function updateEmployee(employeeId, updates) {
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
    .input("salary", sql.Decimal(18, 2), updates.salary)
    .input("Holidays_PA", sql.Int, updates.Holidays_PA)
    .input("JobTitleID", sql.Int, updates.JobTitleID)
    .input("UserID", sql.Int, updates.UserID)
    .input("TeamID", sql.Int, updates.TeamID)
    .input("Active", sql.Bit, updates.Active)
    .query(`
      UPDATE Employee SET
        EmployeeName = @EmployeeName,
        EmployeeEmail = @EmployeeEmail,
        EmployeePhone = @EmployeePhone,
        CityID = @CityID,
        StateProvinceID = @StateProvinceID,
        HireDate = @HireDate,
        TerminationDate = @TerminationDate,
        DepartmentID = @DepartmentID,
        salary = @salary,
        Holidays_PA = @Holidays_PA,
        JobTitleID = @JobTitleID,
        UserID = @UserID,
        TeamID = @TeamID,
        Active = @Active,
        UpdatedAt = GETDATE()
      WHERE EmployeeID = @EmployeeID
    `);
}

// =======================
// Soft delete employee
// =======================
async function deactivateEmployee(employeeId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("EmployeeID", sql.Int, employeeId)
    .query(`
      UPDATE Employee SET Active = 0, UpdatedAt = GETDATE()
      WHERE EmployeeID = @EmployeeID
    `);
}

// =======================
// Exports
// =======================
module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deactivateEmployee
};
