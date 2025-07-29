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
        a.UpdatedAt
      FROM Activity a
      LEFT JOIN ActivityType at ON a.TypeID = at.TypeID
      LEFT JOIN Account acc ON a.AccountID = acc.AccountID
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
          at.Description,
          a.Due_date,
          a.PriorityLevelID,
          ac.ContactID,
          p.Title,
          p.first_name,
          p.middle_name,
          p.surname,
          a.CreatedAt,
          a.UpdatedAt
        FROM Activity a
        LEFT JOIN ActivityType at ON a.TypeID = at.TypeID
        LEFT JOIN Account acc ON a.AccountID = acc.AccountID
        LEFT JOIN ActivityContact ac ON a.ActivityID = ac.ActivityID
        LEFT JOIN Contact c ON ac.ContactID = c.ContactID
        LEFT JOIN Person p ON c.PersonID = p.PersonID
        WHERE a.ActivityID = @ActivityID;
      `);

    return result.recordset[0] || null;
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
    CreatedAt
  } = activityData;

  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool.request()
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

    return result.recordset[0].ActivityID;
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

//All stored procedures
//CreateActivity
// GetActivity
// GetActivityByID
// UpdateActivity
// DeactivateActivity
// ReactivateActivity
// DeleteActivity

// =======================
// Exports
// =======================
module.exports = {
  getAllActivities,
  getActivityDetails,
  createActivity,
  deleteActivity
};
