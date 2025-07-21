const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

//======================================
// Get all activities
//======================================
async function getAllActivities() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT 
        a.ActivityID,
        at.TypeName AS ActivityType,
        acc.AccountName,
        a.Due_date,
        a.PriorityLevelID,
        a.CreatedAt,
        a.UpdatedAt,

        -- Contacts (as JSON array)
        (
          SELECT 
            c.ContactID,
            p.first_name,
            p.middle_name,
            p.surname
          FROM ActivityContact ac
          JOIN Contact c ON ac.ContactID = c.ContactID
          JOIN Person p ON c.PersonID = p.PersonID
          WHERE ac.ActivityID = a.ActivityID
          FOR JSON PATH
        ) AS Contacts,

        -- Notes
        (
          SELECT 
            n.NoteID,
            n.Content,
            n.CreatedAt
          FROM Note n
          WHERE n.EntityID = a.ActivityID AND n.EntityTypeID = (
            SELECT TOP 1 EntityTypeID FROM EntityType WHERE TypeName = 'Activity'
          )
          FOR JSON PATH
        ) AS Notes,

        -- Attachments
        (
          SELECT 
            att.AttachmentID,
            att.FileName,
            att.FileUrl,
            att.UploadedAt
          FROM Attachment att
          WHERE att.EntityID = a.ActivityID AND att.EntityTypeID = (
            SELECT TOP 1 EntityTypeID FROM EntityType WHERE TypeName = 'Activity'
          )
          FOR JSON PATH
        ) AS Attachments

      FROM Activity a
      LEFT JOIN ActivityType at ON a.TypeID = at.TypeID
      LEFT JOIN Account acc ON a.AccountID = acc.AccountID
      WHERE a.Active = 1
    `);

    return result.recordset;
  } catch (error) {
    console.error("Error fetching activities:", error);
    throw error;
  }
}


//======================================
// Get activity details by ID
//======================================
const getActivityDetails = async (id) => {
  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool.request()
      .input('ActivityID', sql.Int, id)
      .query(`
        SELECT 
          a.ActivityID,
          at.TypeName,
          acc.AccountName,
          a.Due_date,
          a.PriorityLevelID,
          a.CreatedAt,
          a.UpdatedAt,

          -- Contacts
          (
            SELECT 
              c.ContactID,
              p.first_name,
              p.middle_name,
              p.surname
            FROM ActivityContact ac
            JOIN Contact c ON ac.ContactID = c.ContactID
            JOIN Person p ON c.PersonID = p.PersonID
            WHERE ac.ActivityID = a.ActivityID
            FOR JSON PATH
          ) AS Contacts,

          -- Notes
          (
            SELECT 
              n.NoteID,
              n.Content,
              n.CreatedAt
            FROM Note n
            WHERE n.EntityID = a.ActivityID AND n.EntityTypeID = (
              SELECT EntityTypeID FROM EntityType WHERE TypeName = 'Activity'
            )
            FOR JSON PATH
          ) AS Notes,

          -- Attachments
          (
            SELECT 
              att.AttachmentID,
              att.FileName,
              att.FileUrl,
              att.UploadedAt
            FROM Attachment att
            WHERE att.EntityID = a.ActivityID AND att.EntityTypeID = (
              SELECT EntityTypeID FROM EntityType WHERE TypeName = 'Activity'
            )
            FOR JSON PATH
          ) AS Attachments

        FROM Activity a
        LEFT JOIN ActivityType at ON a.TypeID = at.TypeID
        LEFT JOIN Account acc ON a.AccountID = acc.AccountID
        WHERE a.ActivityID = @ActivityID;
      `);

    const activity = result.recordset[0];

    if (!activity) return null;

    return {
      ...activity,
      Contacts: JSON.parse(activity.Contacts || '[]'),
      Notes: JSON.parse(activity.Notes || '[]'),
      Attachments: JSON.parse(activity.Attachments || '[]')
    };
  } catch (error) {
    console.error('Error fetching activity by ID:', error);
    throw error;
  }
};

//======================================
// Create new activity
//======================================
const createActivity = async (activityData) => {
  const {
    AccountID,
    TypeID,
    Due_date,
    PriorityLevelID,
    CreatedAt,
    ContactIDs = [],
    Notes = [],
    Attachments = [],
  } = activityData;

  try {
    const pool = await sql.connect(dbConfig);
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    const request = new sql.Request(transaction);

    // Insert into Activity
    const result = await request
      .input('AccountID', sql.Int, AccountID)
      .input('TypeID', sql.Int, TypeID)
      .input('Due_date', sql.SmallDateTime, Due_date)
      .input('PriorityLevelID', sql.Int, PriorityLevelID)
      .input('CreatedAt', sql.SmallDateTime, CreatedAt)
      .query(`
        INSERT INTO Activity (AccountID, TypeID, Due_date, PriorityLevelID, CreatedAt)
        OUTPUT INSERTED.ActivityID
        VALUES (@AccountID, @TypeID, @Due_date, @PriorityLevelID, @CreatedAt)
      `);

    const newActivityId = result.recordset[0].ActivityID;

    // Link contacts
    for (const contactId of ContactIDs) {
      await new sql.Request(transaction)
        .input('ActivityID', sql.Int, newActivityId)
        .input('ContactID', sql.Int, contactId)
        .query(`
          INSERT INTO ActivityContact (ActivityID, ContactID)
          VALUES (@ActivityID, @ContactID)
        `);
    }

    // Insert notes
    for (const note of Notes) {
      await new sql.Request(transaction)
        .input('EntityID', sql.Int, newActivityId)
        .input('EntityTypeID', sql.Int, 1) // assume 1 = Activity in EntityType table
        .input('Content', sql.VarChar(255), note.Content)
        .query(`
          INSERT INTO Note (EntityID, EntityTypeID, Content)
          VALUES (@EntityID, @EntityTypeID, @Content)
        `);
    }

    // Insert attachments
    for (const file of Attachments) {
      await new sql.Request(transaction)
        .input('EntityID', sql.Int, newActivityId)
        .input('EntityTypeID', sql.Int, 1) // assume 1 = Activity in EntityType table
        .input('FileName', sql.VarChar(255), file.FileName)
        .input('FileUrl', sql.VarChar(255), file.FileUrl)
        .query(`
          INSERT INTO Attachment (EntityID, EntityTypeID, FileName, FileUrl)
          VALUES (@EntityID, @EntityTypeID, @FileName, @FileUrl)
        `);
    }

    await transaction.commit();
    return newActivityId;
  } catch (err) {
    console.error('Error creating activity:', err);
    throw err;
  }
};


//======================================
// Delete activity
//======================================
const deleteActivity = async (activityId) => {
  try {
    const pool = await sql.connect(dbConfig);

    await pool.request()
      .input('ActivityID', sql.Int, activityId)
      .query(`
        DELETE FROM Activity WHERE ActivityID = @ActivityID
      `);

    return true;
  } catch (err) {
    console.error('Error deleting activity:', err);
    throw err;
  }
};

module.exports = {
  getAllActivities,
  getActivityDetails,
  createActivity,
  deleteActivity
};



//REMOVED FUNCTION

// //======================================
// // Update activity with change tracking
// //======================================
// async function updateActivity(id, newData) {
//   try {
//     const pool = await sql.connect(dbConfig);

//     const current = await pool.request()
//       .input("ActivityID", sql.Int, id)
//       .query("SELECT * FROM Activity WHERE ActivityID = @ActivityID");

//     const old = current.recordset[0];
//     if (!old) throw new Error("Activity not found");

//     const fieldsToUpdate = [];
//     const inputs = pool.request().input("ActivityID", sql.Int, id);

//     const columns = {
//       AccountID: sql.Int,
//       TypeID: sql.Int,
//       Due_date: sql.SmallDateTime,
//       Priority: sql.TinyInt
//     };

//     for (const field in columns) {
//       if (newData[field] !== undefined && newData[field] !== old[field]) {
//         fieldsToUpdate.push(`${field} = @${field}`);
//         inputs.input(field, columns[field], newData[field]);

//         // Audit log entry for changed field
//         await sql.connect(dbConfig).then(p =>
//           p.request()
//             .input("ActivityID", sql.Int, id)
//             .input("AccountID", sql.Int, field === "AccountID" ? newData[field] : old.AccountID)
//             .input("TypeID", sql.Int, field === "TypeID" ? newData[field] : old.TypeID)
//             .input("Due_date", sql.SmallDateTime, field === "Due_date" ? newData[field] : old.Due_date)
//             .input("Priority", sql.TinyInt, field === "Priority" ? newData[field] : old.Priority)
//             .input("ActionType", sql.VarChar(20), `UPDATE:${field}`)
//             .query(`
//               INSERT INTO TempActivity (ActivityID, AccountID, TypeID, Due_date, Priority, ActionType, ActionTimestamp)
//               VALUES (@ActivityID, @AccountID, @TypeID, @Due_date, @Priority, @ActionType, GETDATE())
//             `)
//         );
//       }
//     }

//     if (fieldsToUpdate.length === 0) return { message: "No changes detected" };

//     await inputs.query(`
//       UPDATE Activity
//       SET ${fieldsToUpdate.join(", ")},
//           UpdatedAt = GETDATE()
//       WHERE ActivityID = @ActivityID
//     `);

//     return { message: "Activity updated successfully" };
//   } catch (error) {
//     console.error("Error updating activity:", error);
//     throw error;
//   }
// }