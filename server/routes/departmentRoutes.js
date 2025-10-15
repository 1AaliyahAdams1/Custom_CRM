const express = require("express");
const router = express.Router();
const DepartmentService = require("../services/departmentService");

// Get all departments
router.get("/", async (req, res) => {
  try {
    console.log("DepartmentRoutes: GET / - Getting all departments");
    const departments = await DepartmentService.getAllDepartments();
    console.log(`DepartmentRoutes: Returning ${departments.length} departments`);
    res.json(departments);
  } catch (error) {
    console.error("DepartmentRoutes Error [GET /]:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get department by ID
router.get("/:id", async (req, res) => {
  try {
    const departmentId = parseInt(req.params.id);
    console.log("DepartmentRoutes: GET /:id - Getting department by ID:", departmentId);
    
    if (isNaN(departmentId)) {
      return res.status(400).json({ error: "Invalid department ID" });
    }

    const department = await DepartmentService.getDepartmentById(departmentId);
    
    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    console.log("DepartmentRoutes: Department found:", department);
    res.json(department);
  } catch (error) {
    console.error("DepartmentRoutes Error [GET /:id]:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create department
router.post("/", async (req, res) => {
  try {
    console.log("DepartmentRoutes: POST / - Creating department:", req.body);
    const department = await DepartmentService.createDepartment(req.body);
    console.log("DepartmentRoutes: Department created successfully:", department);
    res.status(201).json(department);
  } catch (error) {
    console.error("DepartmentRoutes Error [POST /]:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update department
router.put("/:id", async (req, res) => {
  try {
    const departmentId = parseInt(req.params.id);
    console.log("DepartmentRoutes: PUT /:id - Updating department:", departmentId, req.body);
    
    if (isNaN(departmentId)) {
      return res.status(400).json({ error: "Invalid department ID" });
    }

    const department = await DepartmentService.updateDepartment(departmentId, req.body);
    console.log("DepartmentRoutes: Department updated successfully:", department);
    res.json(department);
  } catch (error) {
    console.error("DepartmentRoutes Error [PUT /:id]:", error);
    res.status(500).json({ error: error.message });
  }
});

// Deactivate department
router.patch("/:id/deactivate", async (req, res) => {
  try {
    const departmentId = parseInt(req.params.id);
    console.log("DepartmentRoutes: PATCH /:id/deactivate - Deactivating department:", departmentId);
    
    if (isNaN(departmentId)) {
      return res.status(400).json({ error: "Invalid department ID" });
    }

    const result = await DepartmentService.deactivateDepartment(departmentId);
    console.log("DepartmentRoutes: Department deactivated successfully");
    res.json(result);
  } catch (error) {
    console.error("DepartmentRoutes Error [PATCH /:id/deactivate]:", error);
    res.status(500).json({ error: error.message });
  }
});

// Reactivate department
router.patch("/:id/reactivate", async (req, res) => {
  try {
    const departmentId = parseInt(req.params.id);
    console.log("DepartmentRoutes: PATCH /:id/reactivate - Reactivating department:", departmentId);
    
    if (isNaN(departmentId)) {
      return res.status(400).json({ error: "Invalid department ID" });
    }

    const result = await DepartmentService.reactivateDepartment(departmentId);
    console.log("DepartmentRoutes: Department reactivated successfully");
    res.json(result);
  } catch (error) {
    console.error("DepartmentRoutes Error [PATCH /:id/reactivate]:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete department
router.delete("/:id", async (req, res) => {
  try {
    const departmentId = parseInt(req.params.id);
    console.log("DepartmentRoutes: DELETE /:id - Deleting department:", departmentId);
    
    if (isNaN(departmentId)) {
      return res.status(400).json({ error: "Invalid department ID" });
    }

    const result = await DepartmentService.deleteDepartment(departmentId);
    console.log("DepartmentRoutes: Department deleted successfully");
    res.json(result);
  } catch (error) {
    console.error("DepartmentRoutes Error [DELETE /:id]:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
