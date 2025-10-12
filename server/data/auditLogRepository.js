const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

//======================================
// Get all temp accounts (audit log)
//======================================
const getAllTempAccounts = async () => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .execute("GetAllTempAccounts");
    return result.recordset;
  } catch (error) {
    console.error("Error fetching temp accounts:", error);
    throw error;
  }
};

//======================================
// Get all temp contacts (audit log)
//======================================
const getAllTempContacts = async () => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .execute("GetAllTempContacts");
    return result.recordset;
  } catch (error) {
    console.error("Error fetching temp contacts:", error);
    throw error;
  }
};

//======================================
// Get all temp deals (audit log)
//======================================
const getAllTempDeals = async () => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .execute("GetAllTempDeals");
    return result.recordset;
  } catch (error) {
    console.error("Error fetching temp deals:", error);
    throw error;
  }
};

//======================================
// Get all temp employees (audit log)
//======================================
const getAllTempEmployees = async () => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .execute("GetAllTempEmployees");
    return result.recordset;
  } catch (error) {
    console.error("Error fetching temp employees:", error);
    throw error;
  }
};

//======================================
// Get all temp products (audit log)
//======================================
const getAllTempProducts = async () => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .execute("GetAllTempProducts");
    return result.recordset;
  } catch (error) {
    console.error("Error fetching temp products:", error);
    throw error;
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