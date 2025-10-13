// controllers/auditLogController.js

const auditLogService = require("../services/auditLogService");

//======================================
// Get all temp accounts
//======================================
const getAllTempAccounts = async (req, res) => {
  try {
    const data = await auditLogService.getAllTempAccounts();
    res.status(200).json(data);
  } catch (err) {
    console.error("Error in getAllTempAccounts controller:", err);
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Get all temp contacts
//======================================
const getAllTempContacts = async (req, res) => {
  try {
    const data = await auditLogService.getAllTempContacts();
    res.status(200).json(data);
  } catch (err) {
    console.error("Error in getAllTempContacts controller:", err);
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Get all temp deals
//======================================
const getAllTempDeals = async (req, res) => {
  try {
    const data = await auditLogService.getAllTempDeals();
    res.status(200).json(data);
  } catch (err) {
    console.error("Error in getAllTempDeals controller:", err);
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Get all temp employees
//======================================
const getAllTempEmployees = async (req, res) => {
  try {
    const data = await auditLogService.getAllTempEmployees();
    res.status(200).json(data);
  } catch (err) {
    console.error("Error in getAllTempEmployees controller:", err);
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Get all temp products
//======================================
const getAllTempProducts = async (req, res) => {
  try {
    const data = await auditLogService.getAllTempProducts();
    res.status(200).json(data);
  } catch (err) {
    console.error("Error in getAllTempProducts controller:", err);
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Exports
//======================================
module.exports = {
  getAllTempAccounts,
  getAllTempContacts,
  getAllTempDeals,
  getAllTempEmployees,
  getAllTempProducts
};