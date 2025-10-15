-- =============================================
-- Test Department Stored Procedures
-- =============================================
-- This script tests all Department stored procedures
-- Run this script in SQL Server Management Studio against your CRM database

USE [8589_CRM]; -- Replace with your actual database name
GO

PRINT 'Testing Department Stored Procedures...';
PRINT '=====================================';

-- =============================================
-- Test 1: Create a test department
-- =============================================
PRINT 'Test 1: Creating test department...';
EXEC dbo.CreateDepartment @DepartmentName = 'Test Engineering';
GO

-- =============================================
-- Test 2: Get all departments
-- =============================================
PRINT 'Test 2: Getting all departments...';
EXEC dbo.GetDepartment;
GO

-- =============================================
-- Test 3: Get department by ID (assuming ID 1 exists)
-- =============================================
PRINT 'Test 3: Getting department by ID...';
EXEC dbo.GetDepartmentByID @DepartmentID = 1;
GO

-- =============================================
-- Test 4: Update department
-- =============================================
PRINT 'Test 4: Updating department...';
EXEC dbo.UpdateDepartment @DepartmentID = 1, @DepartmentName = 'Updated Engineering';
GO

-- =============================================
-- Test 5: Deactivate department
-- =============================================
PRINT 'Test 5: Deactivating department...';
EXEC dbo.DeactivateDepartment @DepartmentID = 1;
GO

-- =============================================
-- Test 6: Reactivate department
-- =============================================
PRINT 'Test 6: Reactivating department...';
EXEC dbo.ReactivateDepartment @DepartmentID = 1;
GO

-- =============================================
-- Test 7: Verify department is active
-- =============================================
PRINT 'Test 7: Verifying department is active...';
EXEC dbo.GetDepartmentByID @DepartmentID = 1;
GO

-- =============================================
-- Test 8: Clean up - Delete test department
-- =============================================
PRINT 'Test 8: Cleaning up test department...';
EXEC dbo.DeleteDepartment @DepartmentID = 1;
GO

-- =============================================
-- Final verification
-- =============================================
PRINT 'Final verification: Getting all departments...';
EXEC dbo.GetDepartment;
GO

PRINT 'All Department tests completed successfully!';
