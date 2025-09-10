const { poolPromise } = require("../../dbConfig");

const insertOrUpdateOwner = async (owner) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('ownerID', owner.ownerID)
            .input('userID', owner.userID)
            .input('userName', owner.userName)
            .input('email', owner.email)
            .input('preferredName', owner.preferredName)
            .input('positionInCompany', owner.positionInCompany)
            .input('phoneNumber', owner.phoneNumber)
            .input('linkedinProfile', owner.linkedinProfile)
            .input('pictureWithID', owner.pictureWithID)
            .input('pictureOfID', owner.pictureOfID)
            .input('requestDate', owner.requestDate)
            .input('approved', owner.approved)
            .input('approvedDate', owner.approvedDate)
            .input('emailConfirmed', owner.emailConfirmed)
            .input('companyID', owner.company?.companyID)
            .input('companyName', owner.company?.companyName)
            .query(`
                MERGE INTO EFMOwners AS target
                USING (SELECT @ownerID AS OwnerID) AS source
                ON target.OwnerID = source.OwnerID
                WHEN MATCHED THEN
                    UPDATE SET
                        UserID = @userID,
                        UserName = @userName,
                        Email = @email,
                        PreferredName = @preferredName,
                        PositionInCompany = @positionInCompany,
                        PhoneNumber = @phoneNumber,
                        LinkedinProfile = @linkedinProfile,
                        PictureWithID = @pictureWithID,
                        PictureOfID = @pictureOfID,
                        RequestDate = @requestDate,
                        Approved = @approved,
                        ApprovedDate = @approvedDate,
                        EmailConfirmed = @emailConfirmed,
                        CompanyID = @companyID,
                        CompanyName = @companyName,
                        UpdatedDate = GETDATE()
                WHEN NOT MATCHED THEN
                    INSERT (OwnerID, UserID, UserName, Email, PreferredName, PositionInCompany, 
                           PhoneNumber, LinkedinProfile, PictureWithID, PictureOfID, RequestDate, 
                           Approved, ApprovedDate, EmailConfirmed, CompanyID, CompanyName, 
                           CreatedDate, UpdatedDate)
                    VALUES (@ownerID, @userID, @userName, @email, @preferredName, @positionInCompany,
                           @phoneNumber, @linkedinProfile, @pictureWithID, @pictureOfID, @requestDate,
                           @approved, @approvedDate, @emailConfirmed, @companyID, @companyName,
                           GETDATE(), GETDATE());
            `);
        
        console.log('Owner insert/update result:', result.rowsAffected);
        return result;
    } catch (error) {
        console.error('Error inserting/updating owner:', error);
        throw error;
    }
};

module.exports = { insertOrUpdateOwner };