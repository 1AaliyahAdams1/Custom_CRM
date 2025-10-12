const auditLogRepo = require("../data/auditLogRepository");

//======================================
// Get all temp accounts audit logs
//======================================
const getAllTempAccounts = async () => {
  return await auditLogRepo.getAllTempAccounts();
};

//======================================
// Get all temp contacts audit logs
//======================================
const getAllTempContacts = async () => {
  return await auditLogRepo.getAllTempContacts();
};

//======================================
// Get all temp deals audit logs
//======================================
const getAllTempDeals = async () => {
  return await auditLogRepo.getAllTempDeals();
};

//======================================
// Get all temp employees audit logs
//======================================
const getAllTempEmployees = async () => {
  return await auditLogRepo.getAllTempEmployees();
};

//======================================
// Get all temp products audit logs
//======================================
const getAllTempProducts = async () => {
  return await auditLogRepo.getAllTempProducts();
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