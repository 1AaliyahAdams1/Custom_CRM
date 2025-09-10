const { poolPromise } = require("../../dbConfig");

const insertOrUpdateCompany = async (company) => {
    try {
        const pool = await poolPromise;
        const loc = company.location || {};
        
        const result = await pool.request()
            .input('companyID', company.companyID)
            .input('companyName', company.companyName)
            .input('countryID', loc.country?.countryID)
            .input('countryName', loc.country?.countryName)
            .input('cityID', loc.city?.cityID)
            .input('cityName', loc.city?.cityName)
            .input('area', loc.area)
            .input('street', loc.street)
            .input('postalCode', loc.postalCode)
            .input('latitude', loc.latitude)
            .input('longitude', loc.longitude)
            .input('telephone', company.contact?.telephone)
            .input('website', company.website)
            .input('isVenueCompany', company.capabilities?.isVenueCompany)
            .input('isEventCompany', company.capabilities?.isEventCompany)
            .input('isRecordLabel', company.capabilities?.isRecordLabel)
            .input('dateOfEdit', company.dateOfEdit)
            .query(`
                MERGE INTO EFMCompanies AS target
                USING (SELECT @companyID AS CompanyID) AS source
                ON target.CompanyID = source.CompanyID
                WHEN MATCHED THEN
                    UPDATE SET
                        CompanyName = @companyName,
                        CountryID = @countryID,
                        CountryName = @countryName,
                        CityID = @cityID,
                        CityName = @cityName,
                        Area = @area,
                        Street = @street,
                        PostalCode = @postalCode,
                        Latitude = @latitude,
                        Longitude = @longitude,
                        Telephone = @telephone,
                        Website = @website,
                        IsVenueCompany = @isVenueCompany,
                        IsEventCompany = @isEventCompany,
                        IsRecordLabel = @isRecordLabel,
                        DateOfEdit = @dateOfEdit,
                        UpdatedDate = GETDATE()
                WHEN NOT MATCHED THEN
                    INSERT (CompanyID, CompanyName, CountryID, CountryName, CityID, CityName, 
                           Area, Street, PostalCode, Latitude, Longitude, Telephone, Website, 
                           IsVenueCompany, IsEventCompany, IsRecordLabel, DateOfEdit, 
                           CreatedDate, UpdatedDate)
                    VALUES (@companyID, @companyName, @countryID, @countryName, @cityID, @cityName,
                           @area, @street, @postalCode, @latitude, @longitude, @telephone, @website,
                           @isVenueCompany, @isEventCompany, @isRecordLabel, @dateOfEdit,
                           GETDATE(), GETDATE());
            `);
        
        console.log('Company insert/update result:', result.rowsAffected);
        return result;
    } catch (error) {
        console.error('Error inserting/updating company:', error);
        throw error;
    }
};

module.exports = { insertOrUpdateCompany };