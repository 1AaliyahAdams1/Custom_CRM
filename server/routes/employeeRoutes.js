const express = require("express");
const router = express.Router();
const EmployeeController = require("../controllers/employeeController");
const { authorizeRole } = require("../middleware/authorizeRoleMiddleware");

// Debug route to check user roles
router.get("/debug-roles", (req, res) => {
  console.log('=== EMPLOYEE DEBUG ROUTES ===');
  console.log('User from request:', req.user);
  console.log('User roles:', req.user?.roles);
  console.log('=============================');
  
  res.json({
    message: "Employee debug route",
    user: req.user,
    roles: req.user?.roles,
    timestamp: new Date().toISOString()
  });
});

// Temporary route to test employee data without role checking
router.get("/test-data", async (req, res) => {
  try {
    console.log('=== TESTING EMPLOYEE DATA ENDPOINT ===');
    const EmployeeController = require("../controllers/employeeController");
    const data = await EmployeeController.getAll(req, res);
    console.log('=====================================');
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// All employee routes require C-Level access (multiple role name variants)
// TEMPORARILY DISABLED FOR TESTING - router.get("/", authorizeRole(["C-level", "Clevel", "Admin", "Administrator"]), EmployeeController.getAll);
router.get("/", EmployeeController.getAll); // Temporary: no role check
router.get("/:id", authorizeRole(["C-level", "Clevel", "Admin", "Administrator"]), EmployeeController.getById);
router.post("/", authorizeRole(["C-level", "Clevel", "Admin", "Administrator"]), EmployeeController.create);
router.put("/:id", authorizeRole(["C-level", "Clevel", "Admin", "Administrator"]), EmployeeController.update);
router.put("/deactivate/:id", authorizeRole(["C-level", "Clevel", "Admin", "Administrator"]), EmployeeController.deactivate);
router.put("/reactivate/:id", authorizeRole(["C-level", "Clevel", "Admin", "Administrator"]), EmployeeController.reactivate);
router.delete("/:id", authorizeRole(["C-level", "Clevel", "Admin", "Administrator"]), EmployeeController.delete);

module.exports = router;
