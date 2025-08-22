const express = require("express");
const router = express.Router();
const EmployeeController = require("../controllers/employeeController");

router.get("/", EmployeeController.getAll);
router.get("/:id", EmployeeController.getById);
router.post("/", EmployeeController.create);
router.put("/:id", EmployeeController.update);
router.put("/deactivate/:id", EmployeeController.deactivate);
router.put("/reactivate/:id", EmployeeController.reactivate);
router.delete("/:id", EmployeeController.delete);

module.exports = router;
