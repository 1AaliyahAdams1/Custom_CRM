-- =============================================
-- Employee Stored Procedures
-- =============================================
-- This script creates all necessary stored procedures for Employee operations
-- Run this script in SQL Server Management Studio against your CRM database

USE [8589_CRM]; -- Replace with your actual database name
GO

-- =============================================
-- 1. GetEmployee - Get all employees
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'GetEmployee')
    DROP PROCEDURE dbo.GetEmployee;
GO

CREATE PROCEDURE dbo.GetEmployee
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
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
        TeamID,
        Active,
        CreatedAt,
        UpdatedAt
    FROM dbo.Employee
    WHERE Active = 1
    ORDER BY EmployeeName;
END;
GO

-- =============================================
-- 2. GetEmployeeByID - Get employee by ID
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'GetEmployeeByID')
    DROP PROCEDURE dbo.GetEmployeeByID;
GO

CREATE PROCEDURE dbo.GetEmployeeByID
    @EmployeeID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
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
        TeamID,
        Active,
        CreatedAt,
        UpdatedAt
    FROM dbo.Employee
    WHERE EmployeeID = @EmployeeID;
END;
GO

-- =============================================
-- 3. CreateEmployee - Create new employee
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'CreateEmployee')
    DROP PROCEDURE dbo.CreateEmployee;
GO

CREATE PROCEDURE dbo.CreateEmployee
    @EmployeeID INT = 0, -- Input parameter (not used for new records)
    @EmployeeName NVARCHAR(100),
    @EmployeeEmail VARCHAR(255) = NULL,
    @EmployeePhone VARCHAR(255) = NULL,
    @CityID INT = NULL,
    @CountryID INT = NULL,
    @StateProvinceID INT = NULL,
    @HireDate DATE,
    @TerminationDate DATE = NULL,
    @DepartmentID INT = NULL,
    @Salary DECIMAL(18,0) = NULL,
    @Holidays_PA INT = NULL,
    @JobTitleID INT = NULL,
    @UserID INT,
    @TeamID INT = NULL,
    @Active BIT = 1,
    @ChangedBy INT,
    @ActionTypeID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Insert new employee
        INSERT INTO dbo.Employee (
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
            TeamID,
            Active,
            CreatedAt,
            UpdatedAt
        )
        VALUES (
            @EmployeeName,
            @EmployeeEmail,
            @EmployeePhone,
            @CityID,
            @CountryID,
            @StateProvinceID,
            @HireDate,
            @TerminationDate,
            @DepartmentID,
            @Salary,
            @Holidays_PA,
            @JobTitleID,
            @UserID,
            @TeamID,
            @Active,
            GETDATE(),
            GETDATE()
        );
        
        -- Get the newly created EmployeeID
        DECLARE @NewEmployeeID INT = SCOPE_IDENTITY();
        
        -- Return the new employee ID
        SELECT @NewEmployeeID as EmployeeID;
        
        COMMIT TRANSACTION;
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        -- Re-throw the error
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
GO

-- =============================================
-- 4. UpdateEmployee - Update existing employee
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'UpdateEmployee')
    DROP PROCEDURE dbo.UpdateEmployee;
GO

CREATE PROCEDURE dbo.UpdateEmployee
    @EmployeeID INT,
    @EmployeeName NVARCHAR(100),
    @EmployeeEmail VARCHAR(255) = NULL,
    @EmployeePhone VARCHAR(255) = NULL,
    @CityID INT = NULL,
    @CountryID INT = NULL,
    @StateProvinceID INT = NULL,
    @HireDate DATE,
    @TerminationDate DATE = NULL,
    @DepartmentID INT = NULL,
    @Salary DECIMAL(18,0) = NULL,
    @Holidays_PA INT = NULL,
    @JobTitleID INT = NULL,
    @UserID INT,
    @TeamID INT = NULL,
    @Active BIT = 1,
    @ChangedBy INT,
    @ActionTypeID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        UPDATE dbo.Employee SET
            EmployeeName = @EmployeeName,
            EmployeeEmail = @EmployeeEmail,
            EmployeePhone = @EmployeePhone,
            CityID = @CityID,
            CountryID = @CountryID,
            StateProvinceID = @StateProvinceID,
            HireDate = @HireDate,
            TerminationDate = @TerminationDate,
            DepartmentID = @DepartmentID,
            salary = @Salary,
            Holidays_PA = @Holidays_PA,
            JobTitleID = @JobTitleID,
            UserID = @UserID,
            TeamID = @TeamID,
            Active = @Active,
            UpdatedAt = GETDATE()
        WHERE EmployeeID = @EmployeeID;
        
        IF @@ROWCOUNT = 0
            THROW 50001, 'Employee not found or no changes made', 1;
        
        COMMIT TRANSACTION;
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
GO

-- =============================================
-- 5. DeactivateEmployee - Deactivate employee
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'DeactivateEmployee')
    DROP PROCEDURE dbo.DeactivateEmployee;
GO

CREATE PROCEDURE dbo.DeactivateEmployee
    @EmployeeID INT,
    @ChangedBy INT,
    @ActionTypeID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        UPDATE dbo.Employee SET
            Active = 0,
            UpdatedAt = GETDATE()
        WHERE EmployeeID = @EmployeeID;
        
        IF @@ROWCOUNT = 0
            THROW 50001, 'Employee not found', 1;
        
        COMMIT TRANSACTION;
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
GO

-- =============================================
-- 6. ReactivateEmployee - Reactivate employee
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'ReactivateEmployee')
    DROP PROCEDURE dbo.ReactivateEmployee;
GO

CREATE PROCEDURE dbo.ReactivateEmployee
    @EmployeeID INT,
    @ChangedBy INT,
    @ActionTypeID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        UPDATE dbo.Employee SET
            Active = 1,
            UpdatedAt = GETDATE()
        WHERE EmployeeID = @EmployeeID;
        
        IF @@ROWCOUNT = 0
            THROW 50001, 'Employee not found', 1;
        
        COMMIT TRANSACTION;
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
GO

-- =============================================
-- 7. DeleteEmployee - Delete employee
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'DeleteEmployee')
    DROP PROCEDURE dbo.DeleteEmployee;
GO

CREATE PROCEDURE dbo.DeleteEmployee
    @EmployeeID INT,
    @ChangedBy INT,
    @ActionTypeID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        DELETE FROM dbo.Employee 
        WHERE EmployeeID = @EmployeeID;
        
        IF @@ROWCOUNT = 0
            THROW 50001, 'Employee not found', 1;
        
        COMMIT TRANSACTION;
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
GO

-- =============================================
-- Verify stored procedures were created
-- =============================================
SELECT 
    SCHEMA_NAME(schema_id) as SchemaName,
    name as ProcedureName,
    create_date,
    modify_date
FROM sys.procedures
WHERE name LIKE '%Employee%'
ORDER BY name;

PRINT 'Employee stored procedures created successfully!';
