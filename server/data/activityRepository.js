const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

// View Activities Query
async function getAllActivities() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query("SELECT * FROM Activity");
    return result.recordset;
  } catch (error) {
    console.error("Error fetching activities:", error);
    throw error;
  }
}

// Create Activity Query
async function createActivity(activityData) {
  try {
    const pool = await sql.connect(dbConfig);
    const { AccountID, TypeID, Due_date, Priority = null } = activityData;

    const result = await pool.request()
      .input("AccountID", sql.Int, AccountID)
      .input("TypeID", sql.Int, TypeID)
      .input("Due_date", sql.SmallDateTime, Due_date)
      .input("Priority", sql.TinyInt, Priority)
      .query(`
        INSERT INTO Activity (AccountID, TypeID, Due_date, Priority, CreatedAt, UpdatedAt)
        VALUES (@AccountID, @TypeID, @Due_date, @Priority, GETDATE(), GETDATE());
        SELECT SCOPE_IDENTITY() AS ActivityID;
      `);

    return result.recordset[0];
  } catch (error) {
    console.error("Error creating activity:", error);
    throw error;
  }
}


// Update Activity Query
async function updateActivity(id, activityData) {
  try {
    const pool = await sql.connect(dbConfig);
    const { AccountID, TypeID, Due_date, Priority = null } = activityData;

    await pool.request()
      .input("ActivityID", sql.Int, id)
      .input("AccountID", sql.Int, AccountID)
      .input("TypeID", sql.Int, TypeID)
      .input("Due_date", sql.SmallDateTime, Due_date)
      .input("Priority", sql.TinyInt, Priority)
      .query(`
        UPDATE Activity
        SET AccountID = @AccountID,
            TypeID = @TypeID,
            Due_date = @Due_date,
            Priority = @Priority,
            UpdatedAt = GETDATE()
        WHERE ActivityID = @ActivityID;
      `);
  } catch (error) {
    console.error("Error updating activity:", error);
    throw error;
  }
}

// Delete Activity Query
async function deleteActivity(id) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("ActivityID", sql.Int, id)
      .query("DELETE FROM Activity WHERE ActivityID = @ActivityID");
    return { rowsAffected: result.rowsAffected[0] };
  } catch (error) {
    console.error("Error deleting activity:", error);
    throw error;
  }
}

// Get Activity Details for Details Page
async function getActivityDetails(id) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("ActivityID", sql.Int, id)
      .query(`
        SELECT 
          a.ActivityID,
          at.TypeName,
          at.Description AS TypeDescription,
          acc.AccountName,
          CONCAT(
            COALESCE(p.first_name + ' ', ''),
            COALESCE(p.middle_name + ' ', ''),
            COALESCE(p.surname, '')
          ) AS ContactFullName,
          a.Due_date,
          a.Priority,
          a.CreatedAt,
          a.UpdatedAt
        FROM CRM.dbo.Activity a
        LEFT JOIN CRM.dbo.ActivityType at ON a.TypeID = at.TypeID
        LEFT JOIN CRM.dbo.Account acc ON a.AccountID = acc.AccountID
        LEFT JOIN CRM.dbo.ActivityContact ac ON ac.ActivityID = a.ActivityID
        LEFT JOIN CRM.dbo.Contact c ON ac.ContactID = c.ContactID
        LEFT JOIN CRM.dbo.Person p ON c.PersonID = p.PersonID
        WHERE a.ActivityID = @ActivityID
      `);
    return result.recordset;
  } catch (error) {
    console.error("Error fetching activity details:", error);
    throw error;
  }
}


module.exports = {
  getAllActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  getActivityDetails,
};
