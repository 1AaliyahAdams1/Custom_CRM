const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

//======================================
// Get all activities
//======================================
const getAllActivities = async (onlyActive = true) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('OnlyActive', sql.Bit, onlyActive ? 1 : 0)
      .execute("GetActivity"); 
    return result.recordset;
  } catch (error) {
    console.error("Error fetching all activities:", error);
    throw error;
  }
};

//======================================
// Get activity by ID
//======================================
const getActivityByID = async (ActivityID) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("ActivityID", sql.Int, ActivityID)
      .execute("GetActivityByID");

    return result.recordset[0] || null;
  } catch (error) {
    console.error("Error fetching activity by ID:", error);
    throw error;
  }
};

//======================================
// Create activity
//======================================
const createActivity = async (activityData) => {
  const { AccountID, TypeID, PriorityLevelID, DueToStart, DueToEnd, Completed } = activityData;

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("AccountID", sql.Int, AccountID)
      .input("TypeID", sql.Int, TypeID)
      .input("PriorityLevelID", sql.Int, PriorityLevelID)
      .input("DueToStart", sql.SmallDateTime, DueToStart)
      .input("DueToEnd", sql.SmallDateTime, DueToEnd)
      .input("Completed", sql.SmallDateTime, Completed)
      .execute("CreateActivity");

    return true;
  } catch (error) {
    console.error("Error creating activity:", error);
    throw error;
  }
};

//======================================
// Update activity
//======================================
const updateActivity = async (ActivityID, activityData) => {
  const { AccountID, TypeID, PriorityLevelID, DueToStart, DueToEnd, Completed } = activityData;

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("AccountID", sql.Int, AccountID)
      .input("TypeID", sql.Int, TypeID)
      .input("PriorityLevelID", sql.Int, PriorityLevelID)
      .input("DueToStart", sql.SmallDateTime, DueToStart)
      .input("DueToEnd", sql.SmallDateTime, DueToEnd)
      .input("Completed", sql.SmallDateTime, Completed)
      .execute("UpdateActivity");

    return true;
  } catch (error) {
    console.error("Error updating activity:", error);
    throw error;
  }
};

//======================================
// Deactivate activity
//======================================
const deactivateActivity = async (ActivityID) => {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("ActivityID", sql.Int, ActivityID)
      .execute("DeactivateActivity");

    return true;
  } catch (error) {
    console.error("Error deactivating activity:", error);
    throw error;
  }
};

//======================================
// Reactivate activity
//======================================
const reactivateActivity = async (ActivityID) => {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("ActivityID", sql.Int, ActivityID)
      .execute("ReactivateActivity");

    return true;
  } catch (error) {
    console.error("Error reactivating activity:", error);
    throw error;
  }
};

//======================================
// Delete activity
//======================================
const deleteActivity = async (ActivityID) => {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("ActivityID", sql.Int, ActivityID)
      .execute("DeleteActivity");

    return true;
  } catch (error) {
    console.error("Error deleting activity:", error);
    throw error;
  }
};


async function getActivitiesByUser(userId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("UserID", sql.Int, userId)
      .query(`
        SELECT
          act.[ActivityID],
          act.[AccountID],
          act.[TypeID],
          act.[PriorityLevelID],
          act.[DueToStart],
          act.[DueToEnd],
          act.[Completed],
          act.[CreatedAt],
          act.[UpdatedAt],
          act.[Active],
          act.[SequenceItemID]
        FROM [CRM].[dbo].[Activity] act
        JOIN [CRM].[dbo].[AssignedUser] au ON act.AccountID = au.AccountID AND au.Active = 1
        JOIN [CRM].[dbo].[Account] a ON act.AccountID = a.AccountID AND a.Active = 1
        WHERE au.UserID = @UserID
          AND act.Active = 1;
      `);

    return result.recordset;
  } catch (error) {
    console.error("Error fetching activities for user accounts:", error);
    throw error;
  }
}


//======================================
// Exports
//======================================
module.exports = {
  getAllActivities,
  getActivityByID,
  createActivity,
  updateActivity,
  deactivateActivity,
  reactivateActivity,
  deleteActivity,
  getActivitiesByUser,
};
