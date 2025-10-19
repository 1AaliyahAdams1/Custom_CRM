const EmployeeService = require("../services/employeeService");

class EmployeeController {
  static async getAll(req, res) {
    try {
      const data = await EmployeeService.getAllEmployees();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getById(req, res) {
    try {
      const data = await EmployeeService.getEmployeeById(req.params.id);
      if (!data) return res.status(404).json({ message: "Employee not found" });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async create(req, res) {
    try {
      const { data, changedBy, actionTypeId, loggedInUserId } = req.body;

    

    await EmployeeService.createEmployee(data, changedBy, actionTypeId, loggedInUserId);
    res.status(201).json({ message: "Employee created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
  }

  static async update(req, res) {
    try {
      const { updates, changedBy, actionTypeId } = req.body;
      await EmployeeService.updateEmployee(req.params.id, updates, changedBy, actionTypeId);
      res.json({ message: "Employee updated" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async deactivate(req, res) {
    try {
      const { employee, changedBy, actionTypeId } = req.body;
      await EmployeeService.deactivateEmployee(employee, changedBy, actionTypeId);
      res.json({ message: "Employee deactivated" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async reactivate(req, res) {
    try {
      const { employee, changedBy, actionTypeId } = req.body;
      await EmployeeService.reactivateEmployee(employee, changedBy, actionTypeId);
      res.json({ message: "Employee reactivated" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const { employee, changedBy, actionTypeId } = req.body;
      await EmployeeService.deleteEmployee(employee, changedBy, actionTypeId);
      res.json({ message: "Employee deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = EmployeeController;
