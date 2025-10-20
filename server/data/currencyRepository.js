const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

// Get all currencies
async function getAllCurrencies() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .query("SELECT CurrencyID, Symbol, EnglishName, ISOCode, DecimalPlaces, LocalName, ExchangeRate, Prefix, Active FROM dbo.Currency WHERE Active = 1 ORDER BY EnglishName");
  console.log('Currency Repository: Fetched', result.recordset.length, 'currencies');
  return result.recordset;
}

// Get currency by ID
async function getCurrencyById(id) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("CurrencyID", sql.Int, id)
    .query("SELECT * FROM dbo.Currency WHERE CurrencyID = @CurrencyID");
  return result.recordset[0];
}

// Create new currency
async function createCurrency(data) {
  const {
    Symbol, ISOCode, DecimalPlaces, EnglishName,
    LocalName, ExchangeRate, Prefix
  } = data;

  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("Symbol", sql.NVarChar(5), Symbol)
    .input("ISOCode", sql.NVarChar(3), ISOCode)
    .input("DecimalPlaces", sql.TinyInt, DecimalPlaces)
    .input("EnglishName", sql.NVarChar(100), EnglishName)
    .input("LocalName", sql.NVarChar(100), LocalName)
    .input("ExchangeRate", sql.Decimal(9, 4), ExchangeRate)
    .input("Prefix", sql.Bit, Prefix)
    .input("Active", sql.Bit, true)
    .query(`
      INSERT INTO dbo.Currency (Symbol, ISOCode, DecimalPlaces, EnglishName, LocalName, ExchangeRate, Prefix, Active, LastUpdated)
      VALUES (@Symbol, @ISOCode, @DecimalPlaces, @EnglishName, @LocalName, @ExchangeRate, @Prefix, @Active, GETDATE());
      SELECT SCOPE_IDENTITY() AS CurrencyID
    `);

  return { CurrencyID: result.recordset[0].CurrencyID };
}

// Update currency
async function updateCurrency(id, data) {
  const {
    Symbol, ISOCode, DecimalPlaces, EnglishName,
    LocalName, ExchangeRate, Prefix
  } = data;

  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("CurrencyID", sql.Int, id)
    .input("Symbol", sql.NVarChar(5), Symbol)
    .input("ISOCode", sql.NVarChar(3), ISOCode)
    .input("DecimalPlaces", sql.TinyInt, DecimalPlaces)
    .input("EnglishName", sql.NVarChar(100), EnglishName)
    .input("LocalName", sql.NVarChar(100), LocalName)
    .input("ExchangeRate", sql.Decimal(9, 4), ExchangeRate)
    .input("Prefix", sql.Bit, Prefix)
    .query(`
      UPDATE dbo.Currency
      SET Symbol = @Symbol,
          ISOCode = @ISOCode,
          DecimalPlaces = @DecimalPlaces,
          EnglishName = @EnglishName,
          LocalName = @LocalName,
          ExchangeRate = @ExchangeRate,
          Prefix = @Prefix,
          LastUpdated = GETDATE()
      WHERE CurrencyID = @CurrencyID
    `);

  return { CurrencyID: id };
}

// Deactivate currency
async function deactivateCurrency(id) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("CurrencyID", sql.Int, id)
    .query("UPDATE dbo.Currency SET Active = 0, LastUpdated = GETDATE() WHERE CurrencyID = @CurrencyID");
  return { CurrencyID: id };
}

// Reactivate currency
async function reactivateCurrency(id) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("CurrencyID", sql.Int, id)
    .query("UPDATE dbo.Currency SET Active = 1, LastUpdated = GETDATE() WHERE CurrencyID = @CurrencyID");
  return { CurrencyID: id };
}

// Hard delete currency
async function deleteCurrency(id) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("CurrencyID", sql.Int, id)
    .query("DELETE FROM dbo.Currency WHERE CurrencyID = @CurrencyID");
  return { CurrencyID: id };
}

module.exports = {
  getAllCurrencies,
  getCurrencyById,
  createCurrency,
  updateCurrency,
  deactivateCurrency,
  reactivateCurrency,
  deleteCurrency
};
