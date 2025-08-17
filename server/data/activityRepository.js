const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

//======================================
// Get all activities
//======================================
const getAllActivities = async (onlyActive = true) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("OnlyActive", sql.Bit, onlyActive ? 1 : 0)
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
    const result = await pool
      .request()
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
  const { activity_name, type, date } = activityData;

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("activity_name", sql.VarChar(100), activity_name)
      .input("type", sql.VarChar(50), type)
      .input("date", sql.Date, date)
      .execute("CreateActivity");

    return result.recordset[0] || true;
  } catch (error) {
    console.error("Error creating activity:", error);
    throw error;
  }
};

//======================================
// Update activity
//======================================
const updateActivity = async (ActivityID, activityData) => {
  const { activity_name, type, date } = activityData;

  try {
    const pool = await sql.connect(dbConfig);
    await pool
      .request()
      .input("ActivityID", sql.Int, ActivityID)
      .input("activity_name", sql.VarChar(100), activity_name)
      .input("type", sql.VarChar(50), type)
      .input("date", sql.Date, date)
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
    await pool
      .request()
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
    await pool
      .request()
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
    await pool
      .request()
      .input("ActivityID", sql.Int, ActivityID)
      .execute("DeleteActivity");

    return true;
  } catch (error) {
    console.error("Error deleting activity:", error);
    throw error;
  }
};

//======================================
// Get activities by user
//======================================
async function getActivitiesByUser(userId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().input("UserID", sql.Int, userId).query(`
        SELECT
          act.[ActivityID],
          act.[activity_name],
          act.[type],
          act.[date],
          act.[CreatedAt],
          act.[UpdatedAt],
          act.[Active]
        FROM [CRM].[dbo].[Activity] act
        WHERE act.Active = 1
        ORDER BY act.[date] DESC, act.[CreatedAt] DESC;
      `);

    return result.recordset;
  } catch (error) {
    console.error("Error fetching activities for user:", error);
    throw error;
  }
}

//======================================
// Get activities with pagination
//======================================
const getActivitiesWithPagination = async (
  page = 1,
  pageSize = 10,
  onlyActive = true
) => {
  try {
    const offset = (page - 1) * pageSize;
    const pool = await sql.connect(dbConfig);

    const result = await pool
      .request()
      .input("OnlyActive", sql.Bit, onlyActive ? 1 : 0)
      .input("Offset", sql.Int, offset)
      .input("PageSize", sql.Int, pageSize).query(`
        SELECT 
          ActivityID,
          activity_name,
          type,
          date,
          CreatedAt,
          UpdatedAt,
          Active,
          COUNT(*) OVER() as TotalCount
        FROM Activity
        WHERE (@OnlyActive = 0 OR Active = 1)
        ORDER BY date DESC, CreatedAt DESC
        OFFSET @Offset ROWS 
        FETCH NEXT @PageSize ROWS ONLY
      `);

    return result.recordset;
  } catch (error) {
    console.error("Error fetching activities with pagination:", error);
    throw error;
  }
};

//======================================
// Search activities
//======================================
const searchActivities = async (searchTerm, onlyActive = true) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("SearchTerm", sql.VarChar, `%${searchTerm}%`)
      .input("OnlyActive", sql.Bit, onlyActive ? 1 : 0).query(`
        SELECT 
          ActivityID,
          activity_name,
          type,
          date,
          CreatedAt,
          UpdatedAt,
          Active
        FROM Activity
        WHERE (@OnlyActive = 0 OR Active = 1)
          AND (activity_name LIKE @SearchTerm 
               OR type LIKE @SearchTerm)
        ORDER BY date DESC, CreatedAt DESC
      `);

    return result.recordset;
  } catch (error) {
    console.error("Error searching activities:", error);
    throw error;
  }
};

//======================================
// Get activity count
//======================================
const getActivityCount = async (onlyActive = true) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("OnlyActive", sql.Bit, onlyActive ? 1 : 0).query(`
        SELECT COUNT(*) as count
        FROM Activity
        WHERE (@OnlyActive = 0 OR Active = 1)
      `);

    return result.recordset[0].count;
  } catch (error) {
    console.error("Error getting activity count:", error);
    throw error;
  }
};

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
  getActivitiesWithPagination,
  searchActivities,
  getActivityCount,
};
