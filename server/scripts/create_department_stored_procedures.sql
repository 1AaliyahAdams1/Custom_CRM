-- =============================================
-- Department Stored Procedures
-- =============================================
-- This script creates all necessary stored procedures for Department operations
-- Run this script in SQL Server Management Studio against your CRM database

USE [8589_CRM]; -- Replace with your actual database name
GO

-- =============================================
-- 1. GetDepartment - Get all departments
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'GetDepartment')
    DROP PROCEDURE dbo.GetDepartment;
GO

CREATE PROCEDURE dbo.GetDepartment
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        DepartmentID,
        DepartmentName,
        Active,
        CreatedAt,
        UpdatedAt
    FROM dbo.Department
    ORDER BY DepartmentName;
END;
GO

-- =============================================
-- 2. GetDepartmentByID - Get department by ID
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'GetDepartmentByID')
    DROP PROCEDURE dbo.GetDepartmentByID;
GO

CREATE PROCEDURE dbo.GetDepartmentByID
    @DepartmentID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        DepartmentID,
        DepartmentName,
        Active,
        CreatedAt,
        UpdatedAt
    FROM dbo.Department
    WHERE DepartmentID = @DepartmentID;
END;
GO

-- =============================================
-- 3. CreateDepartment - Create new department
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'CreateDepartment')
    DROP PROCEDURE dbo.CreateDepartment;
GO

CREATE PROCEDURE dbo.CreateDepartment
    @DepartmentName VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Insert new department
        INSERT INTO dbo.Department (
            DepartmentName,
            Active,
            CreatedAt,
            UpdatedAt
        )
        VALUES (
            @DepartmentName,
            1, -- Active by default
            GETDATE(),
            GETDATE()
        );
        
        -- Get the newly created DepartmentID
        DECLARE @NewDepartmentID INT = SCOPE_IDENTITY();
        
        -- Return the new department details
        SELECT 
            DepartmentID,
            DepartmentName,
            Active,
            CreatedAt,
            UpdatedAt
        FROM dbo.Department
        WHERE DepartmentID = @NewDepartmentID;
        
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
-- 4. UpdateDepartment - Update existing department
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'UpdateDepartment')
    DROP PROCEDURE dbo.UpdateDepartment;
GO

CREATE PROCEDURE dbo.UpdateDepartment
    @DepartmentID INT,
    @DepartmentName VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Update department
        UPDATE dbo.Department
        SET 
            DepartmentName = @DepartmentName,
            UpdatedAt = GETDATE()
        WHERE DepartmentID = @DepartmentID;
        
        -- Check if any rows were affected
        IF @@ROWCOUNT = 0
        BEGIN
            RAISERROR('Department with ID %d not found', 16, 1, @DepartmentID);
        END
        
        -- Return the updated department
        SELECT 
            DepartmentID,
            DepartmentName,
            Active,
            CreatedAt,
            UpdatedAt
        FROM dbo.Department
        WHERE DepartmentID = @DepartmentID;
        
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
-- 5. DeactivateDepartment - Deactivate department
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'DeactivateDepartment')
    DROP PROCEDURE dbo.DeactivateDepartment;
GO

CREATE PROCEDURE dbo.DeactivateDepartment
    @DepartmentID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Deactivate department
        UPDATE dbo.Department
        SET 
            Active = 0,
            UpdatedAt = GETDATE()
        WHERE DepartmentID = @DepartmentID;
        
        -- Check if any rows were affected
        IF @@ROWCOUNT = 0
        BEGIN
            RAISERROR('Department with ID %d not found', 16, 1, @DepartmentID);
        END
        
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
-- 6. ReactivateDepartment - Reactivate department
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'ReactivateDepartment')
    DROP PROCEDURE dbo.ReactivateDepartment;
GO

CREATE PROCEDURE dbo.ReactivateDepartment
    @DepartmentID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Reactivate department
        UPDATE dbo.Department
        SET 
            Active = 1,
            UpdatedAt = GETDATE()
        WHERE DepartmentID = @DepartmentID;
        
        -- Check if any rows were affected
        IF @@ROWCOUNT = 0
        BEGIN
            RAISERROR('Department with ID %d not found', 16, 1, @DepartmentID);
        END
        
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
-- 7. DeleteDepartment - Hard delete department
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'DeleteDepartment')
    DROP PROCEDURE dbo.DeleteDepartment;
GO

CREATE PROCEDURE dbo.DeleteDepartment
    @DepartmentID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Check if department is being used by any employees
        IF EXISTS (SELECT 1 FROM dbo.Employee WHERE DepartmentID = @DepartmentID)
        BEGIN
            RAISERROR('Cannot delete department. It is being used by employees.', 16, 1);
        END
        
        -- Delete department
        DELETE FROM dbo.Department
        WHERE DepartmentID = @DepartmentID;
        
        -- Check if any rows were affected
        IF @@ROWCOUNT = 0
        BEGIN
            RAISERROR('Department with ID %d not found', 16, 1, @DepartmentID);
        END
        
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
-- Verify stored procedures were created
-- =============================================
SELECT 
    SCHEMA_NAME(schema_id) as SchemaName,
    name as ProcedureName,
    create_date,
    modify_date
FROM sys.procedures
WHERE name LIKE '%Department%'
ORDER BY name;

PRINT 'Department stored procedures created successfully!';
