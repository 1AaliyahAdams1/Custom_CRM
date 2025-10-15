const sql = require("mssql");
const dbConfig = require("../dbConfig");

class EmployeeService {
  // Get all employees
  static async getAllEmployees() {
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request().execute("GetEmployee");
      return result.recordset;
    } catch (error) {
      console.error("EmployeeService Error [getAllEmployees]:", error);
      throw error;
    }
  }

  // Get employee by ID
  static async getEmployeeById(employeeId) {
    if (!employeeId) throw new Error("employeeId is required");
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request()
        .input("EmployeeID", sql.Int, employeeId)
        .execute("GetEmployeeByID");
      return result.recordset[0] || null;
    } catch (error) {
      console.error("EmployeeService Error [getEmployeeById]:", error);
      throw error;
    }
  }

  // Create employee
  static async createEmployee(data, changedBy, actionTypeId) {
    console.log("=== EmployeeService.createEmployee ===");
    console.log("Data received:", JSON.stringify(data, null, 2));
    console.log("ChangedBy:", changedBy);
    console.log("ActionTypeId:", actionTypeId);

    if (!data.EmployeeName) throw new Error("EmployeeName is required");
    if (!changedBy) throw new Error("changedBy is required");
    if (!actionTypeId) throw new Error("actionTypeId is required");

    const {
      EmployeeName, EmployeeEmail, EmployeePhone,
      CityID, CountryID, StateProvinceID, HireDate, TerminationDate,
      DepartmentID, salary, Holidays_PA, JobTitleID,
      UserID, Active = 1
    } = data;

    console.log("Extracted fields:", {
      EmployeeName, EmployeeEmail, EmployeePhone,
      CityID, CountryID, StateProvinceID, HireDate, TerminationDate,
      DepartmentID, salary, Holidays_PA, JobTitleID,
      UserID, Active
    });

    try {
      const pool = await sql.connect(dbConfig);
      console.log("Database connection established");
      
      // Try stored procedure first, fallback to direct SQL if it fails
      try {
        const result = await pool.request()
          .input("EmployeeID", sql.Int, 0)
          .input("EmployeeName", sql.NVarChar(100), EmployeeName)
          .input("EmployeeEmail", sql.VarChar(255), EmployeeEmail)
          .input("EmployeePhone", sql.VarChar(255), EmployeePhone)
          .input("CityID", sql.Int, CityID)
          .input("CountryID", sql.Int, CountryID)
          .input("StateProvinceID", sql.Int, StateProvinceID)
          .input("HireDate", sql.Date, HireDate)
          .input("TerminationDate", sql.Date, TerminationDate)
          .input("DepartmentID", sql.Int, DepartmentID)
          .input("Salary", sql.Decimal(18, 0), salary)
          .input("Holidays_PA", sql.Int, Holidays_PA)
          .input("JobTitleID", sql.Int, JobTitleID)
          .input("UserID", sql.Int, UserID)
          // Removed TeamID - doesn't exist in database
          .input("Active", sql.Bit, Active)
          .input("ChangedBy", sql.Int, changedBy)
          .input("ActionTypeID", sql.Int, actionTypeId)
          .execute("CreateEmployee");
        
        console.log("Stored procedure executed successfully");
        console.log("Result:", result);
        return result;
      } catch (spError) {
        console.log("Stored procedure failed, trying direct SQL:", spError.message);
        
        // Fallback to direct SQL query
        const result = await pool.request()
          .input("EmployeeName", sql.NVarChar(100), EmployeeName)
          .input("EmployeeEmail", sql.VarChar(255), EmployeeEmail)
          .input("EmployeePhone", sql.VarChar(255), EmployeePhone)
          .input("CityID", sql.Int, CityID)
          .input("CountryID", sql.Int, CountryID)
          .input("StateProvinceID", sql.Int, StateProvinceID)
          .input("HireDate", sql.Date, HireDate)
          .input("TerminationDate", sql.Date, TerminationDate)
          .input("DepartmentID", sql.Int, DepartmentID)
          .input("Salary", sql.Decimal(18, 0), salary)
          .input("Holidays_PA", sql.Int, Holidays_PA)
          .input("JobTitleID", sql.Int, JobTitleID)
          .input("UserID", sql.Int, UserID)
          // Removed TeamID - doesn't exist in database
          .input("Active", sql.Bit, Active)
          .query(`
            INSERT INTO dbo.Employee (
              EmployeeName, EmployeeEmail, EmployeePhone, CityID, CountryID,
              StateProvinceID, HireDate, TerminationDate, DepartmentID, salary,
              Holidays_PA, JobTitleID, UserID, Active, CreatedAt, UpdatedAt
            )
            VALUES (
              @EmployeeName, @EmployeeEmail, @EmployeePhone, @CityID, @CountryID,
              @StateProvinceID, @HireDate, @TerminationDate, @DepartmentID, @Salary,
              @Holidays_PA, @JobTitleID, @UserID, @Active, GETDATE(), GETDATE()
            );
            SELECT SCOPE_IDENTITY() as EmployeeID;
          `);
        
        console.log("Direct SQL executed successfully");
        console.log("Result:", result);
        return result;
      }
    } catch (error) {
      console.error("EmployeeService Error [createEmployee]:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        number: error.number,
        state: error.state,
        severity: error.severity,
        lineNumber: error.lineNumber
      });
      throw error;
    }
  }

  // Update employee
  static async updateEmployee(employeeId, updates, changedBy, actionTypeId) {
    if (!employeeId) throw new Error("employeeId is required");
    if (!changedBy) throw new Error("changedBy is required");
    if (!actionTypeId) throw new Error("actionTypeId is required");

    try {
      const pool = await sql.connect(dbConfig);
      await pool.request()
        .input("EmployeeID", sql.Int, employeeId)
        .input("EmployeeName", sql.NVarChar(100), updates.EmployeeName)
        .input("EmployeeEmail", sql.VarChar(255), updates.EmployeeEmail)
        .input("EmployeePhone", sql.VarChar(255), updates.EmployeePhone)
        .input("CityID", sql.Int, updates.CityID)
        .input("CountryID", sql.Int, updates.CountryID)
        .input("StateProvinceID", sql.Int, updates.StateProvinceID)
        .input("HireDate", sql.Date, updates.HireDate)
        .input("TerminationDate", sql.Date, updates.TerminationDate)
        .input("DepartmentID", sql.Int, updates.DepartmentID)
        .input("Salary", sql.Decimal(18, 0), updates.salary)
        .input("Holidays_PA", sql.Int, updates.Holidays_PA)
        .input("JobTitleID", sql.Int, updates.JobTitleID)
        .input("UserID", sql.Int, updates.UserID)
        // Removed TeamID - doesn't exist in database
        .input("Active", sql.Bit, updates.Active)
        .input("ChangedBy", sql.Int, changedBy)
        .input("ActionTypeID", sql.Int, actionTypeId)
        .execute("UpdateEmployee");
    } catch (error) {
      console.error("EmployeeService Error [updateEmployee]:", error);
      throw error;
    }
  }

  // Deactivate employee
  static async deactivateEmployee(employee, changedBy, actionTypeId) {
    if (!employee || !employee.EmployeeID) throw new Error("employee with EmployeeID is required");
    if (!changedBy) throw new Error("changedBy is required");
    if (!actionTypeId) throw new Error("actionTypeId is required");

    try {
      const pool = await sql.connect(dbConfig);
      await pool.request()
        .input("EmployeeID", sql.Int, employee.EmployeeID)
        .input("ChangedBy", sql.Int, changedBy)
        .input("ActionTypeID", sql.Int, actionTypeId)
        .execute("DeactivateEmployee");
    } catch (error) {
      console.error("EmployeeService Error [deactivateEmployee]:", error);
      throw error;
    }
  }

  // Reactivate employee
  static async reactivateEmployee(employee, changedBy, actionTypeId) {
    if (!employee || !employee.EmployeeID) throw new Error("employee with EmployeeID is required");
    if (!changedBy) throw new Error("changedBy is required");
    if (!actionTypeId) throw new Error("actionTypeId is required");

    try {
      const pool = await sql.connect(dbConfig);
      await pool.request()
        .input("EmployeeID", sql.Int, employee.EmployeeID)
        .input("ChangedBy", sql.Int, changedBy)
        .input("ActionTypeID", sql.Int, actionTypeId)
        .execute("ReactivateEmployee");
    } catch (error) {
      console.error("EmployeeService Error [reactivateEmployee]:", error);
      throw error;
    }
  }

  // Delete employee
  static async deleteEmployee(employee, changedBy, actionTypeId) {
    if (!employee || !employee.EmployeeID) throw new Error("employee with EmployeeID is required");
    if (!changedBy) throw new Error("changedBy is required");
    if (!actionTypeId) throw new Error("actionTypeId is required");

    try {
      const pool = await sql.connect(dbConfig);
      await pool.request()
        .input("EmployeeID", sql.Int, employee.EmployeeID)
        .input("ChangedBy", sql.Int, changedBy)
        .input("ActionTypeID", sql.Int, actionTypeId)
        .execute("DeleteEmployee");
    } catch (error) {
      console.error("EmployeeService Error [deleteEmployee]:", error);
      throw error;
    }
  }
}

module.exports = EmployeeService;
