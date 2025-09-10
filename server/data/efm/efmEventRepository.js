const { poolPromise } = require("../../dbConfig");

const insertOrUpdateEvent = async (event) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('eventID', event.eventID)
            .input('eventName', event.eventName)
            .input('venueID', event.venueID)
            .input('venueName', event.venueName)
            .input('cityID', event.cityID)
            .input('countryID', event.countryID)
            .input('city', event.city)
            .input('country', event.country)
            .input('eventDate', event.eventDate)
            .input('isWeekly', event.isWeekly)
            .input('image1', event.image1)
            .input('parentCompanyID', event.parentCompanyID)
            .input('parentCompanyName', event.parentCompanyName)
            .input('dateOfEdit', event.dateOfEdit)
            .query(`
                MERGE INTO EFMEvents AS target
                USING (SELECT @eventID AS EventID) AS source
                ON target.EventID = source.EventID
                WHEN MATCHED THEN
                    UPDATE SET
                        EventName = @eventName,
                        VenueID = @venueID,
                        VenueName = @venueName,
                        CityID = @cityID,
                        CountryID = @countryID,
                        City = @city,
                        Country = @country,
                        EventDate = @eventDate,
                        IsWeekly = @isWeekly,
                        Image1 = @image1,
                        ParentCompanyID = @parentCompanyID,
                        ParentCompanyName = @parentCompanyName,
                        DateOfEdit = @dateOfEdit,
                        UpdatedDate = GETDATE()
                WHEN NOT MATCHED THEN
                    INSERT (EventID, EventName, VenueID, VenueName, CityID, CountryID, City, Country,
                           EventDate, IsWeekly, Image1, ParentCompanyID, ParentCompanyName, 
                           DateOfEdit, CreatedDate, UpdatedDate)
                    VALUES (@eventID, @eventName, @venueID, @venueName, @cityID, @countryID, 
                           @city, @country, @eventDate, @isWeekly, @image1, @parentCompanyID,
                           @parentCompanyName, @dateOfEdit, GETDATE(), GETDATE());
            `);
        
        console.log('Event insert/update result:', result.rowsAffected);
        return result;
    } catch (error) {
        console.error('Error inserting/updating event:', error);
        throw error;
    }
};

module.exports = { insertOrUpdateEvent };