const sql = require("mssql");
const dbConfig = require("../dbConfig");

// =======================
// Gets a list of all Currencies
// =======================
async function getAllCurrencies() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().query("SELECT * FROM Currency WHERE Active = 1");
  return result.recordset;
}

// =======================
// Gets Currency Details by CurrencyID
// =======================
async function getCurrencyById(id) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("CurrencyID", sql.Int, id)
    .query("SELECT * FROM Currency WHERE CurrencyID = @CurrencyID");
  return result.recordset[0];
}

// =======================
// Creates a new Currency
// =======================
async function createCurrency(data) {
  const {
    Symbol, ISOcode, DecimalPlaces, EnglishName,
    LocalName, ExchangeRate, LastUpdated, Active, Prefix
  } = data;

  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("Symbol", sql.NVarChar(5), Symbol)
    .input("ISOcode", sql.NVarChar(3), ISOcode)
    .input("DecimalPlaces", sql.TinyInt, DecimalPlaces)
    .input("EnglishName", sql.NVarChar(100), EnglishName)
    .input("LocalName", sql.NVarChar(100), LocalName)
    .input("ExchangeRate", sql.Decimal(9, 4), ExchangeRate)
    .input("LastUpdated", sql.SmallDateTime, LastUpdated)
    .input("Active", sql.Bit, Active)
    .input("Prefix", sql.Bit, Prefix)
    .query(`
      INSERT INTO Currency (
        Symbol, ISOcode, DecimalPlaces, EnglishName, LocalName,
        ExchangeRate, LastUpdated, Active, Prefix
      ) VALUES (
        @Symbol, @ISOcode, @DecimalPlaces, @EnglishName, @LocalName,
        @ExchangeRate, @LastUpdated, @Active, @Prefix
      )
    `);
}

//All stored procedures
//CreateCurrency
// GetCurrency
// GetCurrencyByID
// UpdateCurrency
// DeactivateCurrency
// ReactivateCurrency
// DeleteCurrency

// =======================
// Exports
// =======================
module.exports = {
  getAllCurrencies,
  getCurrencyById,
  createCurrency
};
