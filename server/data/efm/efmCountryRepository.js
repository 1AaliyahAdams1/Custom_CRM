const { poolPromise } = require("../../dbConfig");

const insertOrUpdateCountry = async (country) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('countryID', country.countryID)
            .input('countryName', country.countryName)
            .input('currencyID', country.currency)
            .query(`
                MERGE INTO Country AS target
                USING (SELECT @countryID AS EFMCountryID) AS source
                ON target.EFMCountryID = source.EFMCountryID
                WHEN MATCHED THEN
                    UPDATE SET
                        CountryName = @countryName,
                        EFMCurrencyID = @currencyID
                WHEN NOT MATCHED THEN
                    INSERT (EFMCountryID, CountryName, EFMCurrencyID)
                    VALUES (@countryID, @countryName, @currencyID);
            `);
        
        console.log('Country insert/update result:', result.rowsAffected);
        return result;
    } catch (error) {
        console.error('Error inserting/updating country:', error);
        throw error;
    }
};

module.exports = { insertOrUpdateCountry };
