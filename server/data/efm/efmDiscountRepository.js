const { poolPromise } = require("../../dbConfig");

async function insertOrUpdateDiscount(discount) {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('discountCodeID', discount.discountCodeID)
            .input('discountCode', discount.discountCode)
            .input('discountPercentage', discount.discountPercentage)
            .input('companyID', discount.companyID)
            .input('companyName', discount.companyName)
            .input('minEvents', discount.minEvents)
            .input('maxEvents', discount.maxEvents)
            .input('validUntil', discount.validUntil)
            .input('createdBy', discount.createdBy)
            .input('createdByUserName', discount.createdByUserName)
            .input('oneTime', discount.oneTime)
            .input('minCommitted', discount.minCommitted)
            .input('requestReview', discount.requestReview)
            .query(`
                MERGE INTO EFMDiscountCodes AS target
                USING (SELECT @discountCodeID AS DiscountCodeID) AS source
                ON target.DiscountCodeID = source.DiscountCodeID
                WHEN MATCHED THEN
                    UPDATE SET
                        DiscountCode = @discountCode,
                        DiscountPercentage = @discountPercentage,
                        CompanyID = @companyID,
                        CompanyName = @companyName,
                        MinEvents = @minEvents,
                        MaxEvents = @maxEvents,
                        ValidUntil = @validUntil,
                        CreatedBy = @createdBy,
                        CreatedByUserName = @createdByUserName,
                        OneTime = @oneTime,
                        MinCommitted = @minCommitted,
                        RequestReview = @requestReview,
                        UpdatedDate = GETDATE()
                WHEN NOT MATCHED THEN
                    INSERT (DiscountCodeID, DiscountCode, DiscountPercentage, CompanyID, CompanyName,
                           MinEvents, MaxEvents, ValidUntil, CreatedBy, CreatedByUserName, OneTime, 
                           MinCommitted, RequestReview, CreatedDate, UpdatedDate)
                    VALUES (@discountCodeID, @discountCode, @discountPercentage, @companyID, @companyName,
                           @minEvents, @maxEvents, @validUntil, @createdBy, @createdByUserName, @oneTime,
                           @minCommitted, @requestReview, GETDATE(), GETDATE());
            `);
        
        console.log('Discount insert/update result:', result.rowsAffected);
        return result;
    } catch (error) {
        console.error('Error inserting/updating discount:', error);
        throw error;
    }
}

module.exports = { insertOrUpdateDiscount };