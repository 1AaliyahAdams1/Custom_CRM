const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

// =======================
// Get all currencies
// =======================
async function getAllCurrencies() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().execute("GetCurrency");
  return result.recordset.filter(c => c.Active === 1);
}

// =======================
// Get currency by ID
// =======================
async function getCurrencyById(id) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("CurrencyID", sql.Int, id)
    .execute("GetCurrencyByID");
  return result.recordset[0];
}

// =======================
// Create new currency
// =======================
async function createCurrency(data) {
  const {
    Symbol, ISOcode, DecimalPlaces, EnglishName,
    LocalName, ExchangeRate, Prefix
  } = data;

  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("Symbol", sql.NVarChar(5), Symbol)
    .input("ISOcode", sql.NVarChar(3), ISOcode)
    .input("DecimalPlaces", sql.TinyInt, DecimalPlaces)
    .input("EnglishName", sql.NVarChar(100), EnglishName)
    .input("LocalName", sql.NVarChar(100), LocalName)
    .input("ExchangeRate", sql.Decimal(9, 4), ExchangeRate)
    .input("Prefix", sql.Bit, Prefix)
    .execute("CreateCurrency");

  return { message: "Currency created" };
}

// =======================
// Update currency by ID
// =======================
async function updateCurrency(id, data) {
  const {
    Symbol, ISOcode, DecimalPlaces, EnglishName,
    LocalName, ExchangeRate, Prefix
  } = data;

  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("CurrencyID", sql.Int, id)
    .input("Symbol", sql.NVarChar(5), Symbol)
    .input("ISOcode", sql.NVarChar(3), ISOcode)
    .input("DecimalPlaces", sql.TinyInt, DecimalPlaces)
    .input("EnglishName", sql.NVarChar(100), EnglishName)
    .input("LocalName", sql.NVarChar(100), LocalName)
    .input("ExchangeRate", sql.Decimal(9, 4), ExchangeRate)
    .input("Prefix", sql.Bit, Prefix)
    .execute("UpdateCurrency");

  return { message: "Currency updated", CurrencyID: id };
}

// =======================
// Deactivate currency by ID
// =======================
async function deleteCurrency(id) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("CurrencyID", sql.Int, id)
    .execute("DeactivateCurrency");
  return { message: "Currency deactivated", CurrencyID: id };
}

// =======================
// Reactivate currency by ID
// =======================
async function reactivateCurrency(id) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("CurrencyID", sql.Int, id)
    .execute("ReactivateCurrency");
  return { message: "Currency reactivated", CurrencyID: id };
}

// =======================
// Hard delete currency by ID
// =======================
async function hardDeleteCurrency(id) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("CurrencyID", sql.Int, id)
    .execute("DeleteCurrency");
  return { message: "Currency hard deleted", CurrencyID: id };
}

module.exports = {
  getAllCurrencies,
  getCurrencyById,
  createCurrency,
  updateCurrency,
  deleteCurrency,
  reactivateCurrency,
  hardDeleteCurrency,
};
