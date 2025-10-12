const express = require("express");
const router = express.Router();
const auditLogController = require("../controllers/auditLogController");

//======================================
// Audit Log Routes
//======================================

// Get all temp accounts audit logs
router.get("/accounts", auditLogController.getAllTempAccounts);

// Get all temp contacts audit logs
router.get("/contacts", auditLogController.getAllTempContacts);

// Get all temp deals audit logs
router.get("/deals", auditLogController.getAllTempDeals);

// Get all temp employees audit logs
router.get("/employees", auditLogController.getAllTempEmployees);

// Get all temp products audit logs
router.get("/products", auditLogController.getAllTempProducts);

module.exports = router;