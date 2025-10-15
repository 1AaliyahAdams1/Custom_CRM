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