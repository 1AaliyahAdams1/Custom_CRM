const sql = require("mssql");
const { dbConfig } = require("./server/dbConfig");

async function testCurrencyAPI() {
  try {
    console.log('Testing Currency API...');
    const pool = await sql.connect(dbConfig);
    console.log('Connected to database successfully');

    // Check if currencies table exists and has data
    const checkResult = await pool.request()
      .query("SELECT COUNT(*) as count FROM dbo.Currency WHERE Active = 1");
    
    console.log(`Active currencies in database: ${checkResult.recordset[0].count}`);

    if (checkResult.recordset[0].count === 0) {
      console.log('No active currencies found. Inserting sample currencies...');
      
      // Insert sample currencies
      const sampleCurrencies = [
        {
          Symbol: '$',
          ISOCode: 'USD',
          DecimalPlaces: 2,
          EnglishName: 'US Dollar',
          LocalName: 'US Dollar',
          ExchangeRate: 1.0000,
          Prefix: true,
          Active: true
        },
        {
          Symbol: '€',
          ISOCode: 'EUR',
          DecimalPlaces: 2,
          EnglishName: 'Euro',
          LocalName: 'Euro',
          ExchangeRate: 0.8500,
          Prefix: true,
          Active: true
        },
        {
          Symbol: '£',
          ISOCode: 'GBP',
          DecimalPlaces: 2,
          EnglishName: 'British Pound',
          LocalName: 'British Pound',
          ExchangeRate: 0.7500,
          Prefix: true,
          Active: true
        }
      ];

      for (const currency of sampleCurrencies) {
        try {
          await pool.request()
            .input("Symbol", sql.NVarChar(5), currency.Symbol)
            .input("ISOCode", sql.NVarChar(3), currency.ISOCode)
            .input("DecimalPlaces", sql.TinyInt, currency.DecimalPlaces)
            .input("EnglishName", sql.NVarChar(100), currency.EnglishName)
            .input("LocalName", sql.NVarChar(100), currency.LocalName)
            .input("ExchangeRate", sql.Decimal(9, 4), currency.ExchangeRate)
            .input("Prefix", sql.Bit, currency.Prefix)
            .input("Active", sql.Bit, currency.Active)
            .query(`
              IF NOT EXISTS (SELECT 1 FROM dbo.Currency WHERE ISOCode = @ISOCode)
              BEGIN
                INSERT INTO dbo.Currency (Symbol, ISOCode, DecimalPlaces, EnglishName, LocalName, ExchangeRate, Prefix, Active, LastUpdated)
                VALUES (@Symbol, @ISOCode, @DecimalPlaces, @EnglishName, @LocalName, @ExchangeRate, @Prefix, @Active, GETDATE());
              END
            `);
          
          console.log(`Inserted/Checked currency: ${currency.EnglishName} (${currency.Symbol})`);
        } catch (error) {
          console.error(`Error inserting currency ${currency.EnglishName}:`, error.message);
        }
      }
    }

    // Test the actual query used by the API
    const result = await pool.request()
      .query("SELECT CurrencyID, Symbol, EnglishName, ISOCode, DecimalPlaces, LocalName, ExchangeRate, Prefix, Active FROM dbo.Currency WHERE Active = 1 ORDER BY EnglishName");
    
    console.log('Currency API Query Result:');
    console.log('Number of currencies:', result.recordset.length);
    console.log('Sample currency:', result.recordset[0]);
    
    // Show all currencies
    result.recordset.forEach(currency => {
      console.log(`- ${currency.CurrencyID}: ${currency.Symbol} ${currency.ISOCode} - ${currency.EnglishName}`);
    });

    await pool.close();
    console.log('Currency API test completed successfully!');
    
  } catch (error) {
    console.error('Error testing currency API:', error);
  }
}

testCurrencyAPI();