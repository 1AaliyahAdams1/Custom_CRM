-- =============================================
-- Test Employee Creation
-- =============================================
-- This script tests the employee creation with sample data
-- Run this to verify your stored procedures work correctly

USE [8589_CRM]; -- Replace with your actual database name
GO

-- Test the CreateEmployee stored procedure with sample data
DECLARE @EmployeeID INT;

EXEC dbo.CreateEmployee
    @EmployeeID = 0,
    @EmployeeName = 'Ali Hassan',
    @EmployeeEmail = 'ali.hassan@company.com',
    @EmployeePhone = '+923001234567',
    @CityID = 1,
    @CountryID = 1,
    @StateProvinceID = 1,
    @HireDate = '2025-01-15',
    @TerminationDate = NULL,
    @DepartmentID = 1,
    @Salary = 75000,
    @Holidays_PA = 20,
    @JobTitleID = 1,
    @UserID = 1,
    @Active = 1,
    @ChangedBy = 1,
    @ActionTypeID = 1;

-- Check if the employee was created
SELECT TOP 1 
    EmployeeID,
    EmployeeName,
    EmployeeEmail,
    EmployeePhone,
    CityID,
    CountryID,
    StateProvinceID,
    HireDate,
    TerminationDate,
    DepartmentID,
    salary,
    Holidays_PA,
    JobTitleID,
    UserID,
    Active,
    CreatedAt,
    UpdatedAt
FROM dbo.Employee 
WHERE EmployeeName = 'Ali Hassan'
ORDER BY CreatedAt DESC;

PRINT 'Employee creation test completed!';
