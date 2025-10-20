const sql = require("mssql");
const { dbConfig } = require("./server/dbConfig");

async function insertSampleCurrencies() {
  try {
    console.log('Connecting to database...');
    const pool = await sql.connect(dbConfig);
    console.log('Connected to database successfully');

    // Sample currencies data
    const sampleCurrencies = [
      {
        Symbol: '$',
        ISOcode: 'USD',
        DecimalPlaces: 2,
        EnglishName: 'US Dollar',
        LocalName: 'US Dollar',
        ExchangeRate: 1.0000,
        Prefix: true,
        Active: true
      },
      {
        Symbol: '€',
        ISOcode: 'EUR',
        DecimalPlaces: 2,
        EnglishName: 'Euro',
        LocalName: 'Euro',
        ExchangeRate: 0.8500,
        Prefix: true,
        Active: true
      },
      {
        Symbol: '£',
        ISOcode: 'GBP',
        DecimalPlaces: 2,
        EnglishName: 'British Pound',
        LocalName: 'British Pound',
        ExchangeRate: 0.7500,
        Prefix: true,
        Active: true
      },
      {
        Symbol: '¥',
        ISOcode: 'JPY',
        DecimalPlaces: 0,
        EnglishName: 'Japanese Yen',
        LocalName: 'Japanese Yen',
        ExchangeRate: 110.0000,
        Prefix: true,
        Active: true
      },
      {
        Symbol: 'R',
        ISOcode: 'ZAR',
        DecimalPlaces: 2,
        EnglishName: 'South African Rand',
        LocalName: 'South African Rand',
        ExchangeRate: 15.5000,
        Prefix: true,
        Active: true
      }
    ];

    console.log('Inserting sample currencies...');
    
    for (const currency of sampleCurrencies) {
      try {
        const result = await pool.request()
          .input("Symbol", sql.NVarChar(5), currency.Symbol)
          .input("ISOcode", sql.NVarChar(3), currency.ISOcode)
          .input("DecimalPlaces", sql.TinyInt, currency.DecimalPlaces)
          .input("EnglishName", sql.NVarChar(100), currency.EnglishName)
          .input("LocalName", sql.NVarChar(100), currency.LocalName)
          .input("ExchangeRate", sql.Decimal(9, 4), currency.ExchangeRate)
          .input("Prefix", sql.Bit, currency.Prefix)
          .input("Active", sql.Bit, currency.Active)
          .query(`
            IF NOT EXISTS (SELECT 1 FROM dbo.Currency WHERE ISOcode = @ISOcode)
            BEGIN
              INSERT INTO dbo.Currency (Symbol, ISOcode, DecimalPlaces, EnglishName, LocalName, ExchangeRate, Prefix, Active, LastUpdated)
              VALUES (@Symbol, @ISOcode, @DecimalPlaces, @EnglishName, @LocalName, @ExchangeRate, @Prefix, @Active, GETDATE());
            END
          `);
        
        console.log(`Inserted/Checked currency: ${currency.EnglishName} (${currency.Symbol})`);
      } catch (error) {
        console.error(`Error inserting currency ${currency.EnglishName}:`, error.message);
      }
    }

    // Verify the currencies were inserted
    const verifyResult = await pool.request()
      .query("SELECT COUNT(*) as count FROM dbo.Currency WHERE Active = 1");
    
    console.log(`Total active currencies in database: ${verifyResult.recordset[0].count}`);

    // Show all currencies
    const allCurrencies = await pool.request()
      .query("SELECT CurrencyID, Symbol, EnglishName, ISOcode FROM dbo.Currency WHERE Active = 1 ORDER BY EnglishName");
    
    console.log('All currencies in database:');
    allCurrencies.recordset.forEach(currency => {
      console.log(`- ${currency.Symbol} - ${currency.EnglishName} (${currency.ISOcode})`);
    });

    await pool.close();
    console.log('Sample currencies inserted successfully!');
    
  } catch (error) {
    console.error('Error inserting sample currencies:', error);
  }
}

insertSampleCurrencies();
