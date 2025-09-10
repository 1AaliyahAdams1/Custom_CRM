const { poolPromise } = require("../../dbConfig");

const insertOrUpdateVenue = async (venue) => {
    try {
        const pool = await poolPromise;

        // Check if city exists
        let cityID = null;
        if (venue.location?.city?.cityID) {
            const cityResult = await pool.request()
                .input('efmCityID', venue.location.city.cityID)
                .query('SELECT CityID FROM City WHERE EFMCityID = @efmCityID');

            if (!cityResult.recordset.length) {
                console.warn(`Skipping venue "${venue.name}" because city EFMCityID ${venue.location.city.cityID} not found`);
                return; // skip this venue
            }

            cityID = cityResult.recordset[0].CityID;
        }

        // Check if Account exists
        const accountCheck = await pool.request()
            .input('accountID', venue.id)
            .query('SELECT AccountID FROM Account WHERE AccountID = @accountID');

        if (accountCheck.recordset.length === 0) {
            // Insert Account with IDENTITY_INSERT ON
            await pool.request()
                .input('accountID', venue.id)
                .input('accountName', venue.name)
                .input('countryID', venue.location?.country?.countryID || null)
                .input('cityID', cityID)
                .input('street1', venue.location?.street || null)
                .input('postalCode', venue.location?.postalCode || null)
                .input('primaryPhone', venue.contact?.telephone || null)
                .input('website', venue.contact?.website || null)
                .input('createdAt', new Date())
                .input('updatedAt', new Date())
                .query(`
                    SET IDENTITY_INSERT Account ON;
                    INSERT INTO Account (
                        AccountID, AccountName, CountryID, CityID,
                        street_address1, postal_code, PrimaryPhone, Website, CreatedAt, UpdatedAt, Active
                    ) VALUES (
                        @accountID, @accountName, @countryID, @cityID,
                        @street1, @postalCode, @primaryPhone, @website, @createdAt, @updatedAt, 1
                    );
                    SET IDENTITY_INSERT Account OFF;
                `);
            console.log(`Inserted Account: ID ${venue.id} - ${venue.name}`);
        } else {
            // Update Account
            await pool.request()
                .input('accountID', venue.id)
                .input('accountName', venue.name)
                .input('countryID', venue.location?.country?.countryID || null)
                .input('cityID', cityID)
                .input('street1', venue.location?.street || null)
                .input('postalCode', venue.location?.postalCode || null)
                .input('primaryPhone', venue.contact?.telephone || null)
                .input('website', venue.contact?.website || null)
                .input('updatedAt', new Date())
                .query(`
                    UPDATE Account
                    SET AccountName = @accountName,
                        CountryID = @countryID,
                        CityID = @cityID,
                        street_address1 = @street1,
                        postal_code = @postalCode,
                        PrimaryPhone = @primaryPhone,
                        Website = @website,
                        UpdatedAt = @updatedAt
                    WHERE AccountID = @accountID;
                `);
            console.log(`Updated Account: ID ${venue.id} - ${venue.name}`);
        }

        // Merge into EFMadditional
        await pool.request()
            .input('accountID', venue.id)
            .input('venueID', venue.id)
            .input('venueTypeID', venue.type?.id || null)
            .input('venueOpeningDate', venue.operating?.openingDate || null)
            .input('venueClosingDate', venue.operating?.closingDate || null)
            .input('efmCompanyID', venue.parentCompany?.id || null)
            .query(`
                MERGE INTO EFMadditional AS target
                USING (SELECT @accountID AS AccountID) AS source
                ON target.AccountID = source.AccountID
                WHEN MATCHED THEN
                    UPDATE SET
                        VenueID = @venueID,
                        VenueTypeID = @venueTypeID,
                        VenueOpeningDate = @venueOpeningDate,
                        VenueClosingDate = @venueClosingDate,
                        EFMCompanyID = @efmCompanyID
                WHEN NOT MATCHED THEN
                    INSERT (AccountID, VenueID, VenueTypeID, VenueOpeningDate, VenueClosingDate, EFMCompanyID)
                    VALUES (@accountID, @venueID, @venueTypeID, @venueOpeningDate, @venueClosingDate, @efmCompanyID);
            `);

        console.log(`EFMadditional synced: ID ${venue.id} - ${venue.name}`);

        return { success: true, message: `Venue ${venue.name} synced successfully` };

    } catch (error) {
        console.error(`Error inserting/updating venue "${venue.name}":`, error.message);
        // Don't throw, continue with next venue
        return { success: false, message: `Skipped venue ${venue.name} due to error` };
    }
};

module.exports = { insertOrUpdateVenue };
