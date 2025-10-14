const express = require("express");
const router = express.Router();

const departmentController = require("../controllers/departmentController");

//======================================
// Department Routes
//======================================
// Get all departments
router.get("/", departmentController.getAllDepartments);
// Get department by ID
router.get("/:id", departmentController.getDepartmentById);
// Create a new department
router.post("/", departmentController.createDepartment);
// Update an existing department
router.put("/:id", departmentController.updateDepartment);
// Deactivate a department
router.delete("/:id", departmentController.deactivateDepartment);
// Reactivate a department
router.patch("/:id/reactivate", departmentController.reactivateDepartment);
module.exports = router;

