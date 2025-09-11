const { poolPromise } = require("../../dbConfig");

const insertOrUpdateCity = async (city) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('cityID', city.cityID)
            .input('cityName', city.cityName)
            .input('countryID', city.country?.countryID)
            .query(`
                ;WITH Source AS (
                    SELECT @cityID AS EFMCityID,
                           @cityName AS CityName,
                           @countryID AS CountryID
                )
                MERGE INTO City AS target
                USING Source AS source
                ON target.EFMCityID = source.EFMCityID
                WHEN MATCHED THEN
                    UPDATE SET
                        CityName = source.CityName,
                        CountryID = source.CountryID
                WHEN NOT MATCHED THEN
                    INSERT (EFMCityID, CityName, CountryID)
                    VALUES (source.EFMCityID, source.CityName, source.CountryID);
            `);

        console.log('City insert/update result:', result.rowsAffected);
        return result;

    } catch (error) {
        console.error('Error inserting/updating city:', error);
        throw error;
    }
};

module.exports = { insertOrUpdateCity };
