const departmentService = require('../services/departmentService');

//======================================
// Get all departments
//======================================
const getAllDepartments = async (req, res) => {
    try {
        const data = await departmentService.getAllDepartments();
        console.log('📊 Backend: getAllDepartments called');
        console.log('📊 Backend: Data from service:', JSON.stringify(data, null, 2)); // ✅ KEY LINE
        console.log('📊 Backend: Data length:', data?.length);
        console.log('📊 Backend: Is array?', Array.isArray(data));
        res.status(200).json(data);
    }
    catch (err) {
        console.error("Error in getAllDepartments controller:", err);
        res.status(500).json({ error: err.message });
    }
};

//======================================
// Get department by ID
//======================================
const getDepartmentById = async (req, res) => {
    const departmentId = req.params.id; 
    try {
        const data = await departmentService.getDepartmentById(departmentId);
        if (!data) {
            return res.status(404).json({ error: "Department not found" });
        }
        res.status(200).json(data);
    }
    catch (err) {
        console.error("Error in getDepartmentById controller:", err);
        res.status(500).json({ error: err.message });
    }
};

//======================================
// Create a new department
//======================================
const createDepartment = async (req, res) => {
    const { departmentName } = req.body;
    try {
        if (!departmentName) {
            return res.status(400).json({ error: "Department name is required" });
        }
        const newDepartment = await departmentService.createDepartment(departmentName);
        res.status(201).json(newDepartment);
    }
    catch (err) {
        console.error("Error in createDepartment controller:", err);
        res.status(500).json({ error: err.message });
    }
};

//======================================
// Update an existing department
//======================================
const updateDepartment = async (req, res) => {
    const departmentId = req.params.id;
    const { departmentName } = req.body;
    try {
        if (!departmentName) {
            return res.status(400).json({ error: "Department name is required" });
        }
        const updatedDepartment = await departmentService.updateDepartment(departmentId, departmentName);
        if (!updatedDepartment) {
            return res.status(404).json({ error: "Department not found" });
        }
        res.status(200).json(updatedDepartment);
    }
    catch (err) {
        console.error("Error in updateDepartment controller:", err);
        res.status(500).json({ error: err.message });
    }
};
//======================================
// Deactivate a department
//======================================
const deactivateDepartment = async (req, res) => {
    const departmentId = req.params.id;
    try {
        const result = await departmentService.deactivateDepartment(departmentId);
        if (!result) {
            return res.status(404).json({ error: "Department not found or already deactivated" });
        }
        res.status(200).json({ message: "Department deactivated successfully" });
    }
    catch (err) {
        console.error("Error in deactivateDepartment controller:", err);
        res.status(500).json({ error: err.message });
    }
};

//======================================
// Reactivate a department
//======================================
const reactivateDepartment = async (req, res) => {
    const departmentId = req.params.id;
    try {
        const result = await departmentService.reactivateDepartment(departmentId);
        if (!result) {
            return res.status(404).json({ error: "Department not found or already active" });
        }
        res.status(200).json({ message: "Department reactivated successfully" });
    }
    catch (err) {
        console.error("Error in reactivateDepartment controller:", err);
        res.status(500).json({ error: err.message });
    }
};
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
    


