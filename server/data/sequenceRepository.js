const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

//============================================
// Get Sequences (with SequenceItems) by User
//============================================
async function getSequencesandItemsByUser(userId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("UserID", sql.Int, userId)
      .query(`
        SELECT  
            seq.SequenceID, 
            seq.SequenceName, 
            seq.SequenceDescription, 
            seq.CreatedAt AS SequenceCreatedAt, 
            seq.UpdatedAt AS SequenceUpdatedAt, 
            seq.Active AS SequenceActive, 
            si.SequenceItemID, 
            si.ActivityTypeID, 
            si.SequenceItemDescription, 
            si.CreatedAt AS SequenceItemCreatedAt, 
            si.UpdatedAt AS SequenceItemUpdatedAt, 
            si.Active AS SequenceItemActive, 
            si.DaysFromStart, 
            acc.AccountID, 
            acc.AccountName 
        FROM AssignedUser au 
        INNER JOIN Account acc ON au.AccountID = acc.AccountID 
        INNER JOIN Sequence seq ON acc.SequenceID = seq.SequenceID 
        LEFT JOIN SequenceItem si ON seq.SequenceID = si.SequenceID 
        WHERE au.UserID = @UserID 
          AND au.Active = 1 
          AND acc.Active = 1 
          AND seq.Active = 1 
        ORDER BY acc.AccountID, seq.SequenceID, si.DaysFromStart;
      `);

    return result.recordset;
  } catch (err) {
    console.error("Database error in getSequencesandItemsByUser:", err);
    throw err;
  }
}

//============================================
// Get User Sequences with Accounts by UserID
//============================================
async function getUserSequences(userId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("UserID", sql.Int, userId)
      .query(`
        SELECT 
            u.UserID, 
            u.Username, 
            acc.AccountID, 
            acc.AccountName, 
            seq.SequenceID, 
            seq.SequenceName, 
            seq.SequenceDescription, 
            seq.CreatedAt AS SequenceCreatedAt, 
            seq.UpdatedAt AS SequenceUpdatedAt, 
            seq.Active AS SequenceActive 
        FROM AssignedUser au 
        INNER JOIN Users u ON au.UserID = u.UserID 
        INNER JOIN Account acc ON au.AccountID = acc.AccountID 
        INNER JOIN Sequence seq ON acc.SequenceID = seq.SequenceID 
        WHERE u.UserID = @UserID 
          AND au.Active = 1 
          AND acc.Active = 1 
          AND seq.Active = 1 
        ORDER BY acc.AccountName, seq.SequenceName;
      `);

    return result.recordset;
  } catch (err) {
    console.error("Database error in getUserSequences:", err);
    throw err;
  }
}

//========================
// Get Activities by User 
//========================
async function getActivitiesByUser(userId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("UserID", sql.Int, userId)
      .query(`
        SELECT  
            a.ActivityID, 
            a.AccountID, 
            acc.AccountName, 
            a.TypeID, 
            at.TypeName AS ActivityTypeName, 
            at.Description AS ActivityTypeDescription, 
            a.PriorityLevelID, 
            pl.PriorityLevelName, 
            pl.PriorityLevelValue, 
            a.DueToStart, 
            a.DueToEnd, 
            a.Completed, 
            a.SequenceItemID, 
            seq.SequenceID, 
            seq.SequenceName, 
            si.SequenceItemDescription, 
            a.CreatedAt AS ActivityCreated, 
            a.UpdatedAt AS ActivityUpdated, 
            a.Active AS ActivityActive 
        FROM Activity a 
        INNER JOIN AssignedUser au ON a.AccountID = au.AccountID 
        INNER JOIN Account acc ON a.AccountID = acc.AccountID 
        INNER JOIN ActivityType at ON a.TypeID = at.TypeID AND at.Active = 1 
        INNER JOIN PriorityLevel pl ON a.PriorityLevelID = pl.PriorityLevelID AND pl.Active = 1 
        LEFT JOIN SequenceItem si ON a.SequenceItemID = si.SequenceItemID 
        LEFT JOIN Sequence seq ON si.SequenceID = seq.SequenceID 
        WHERE au.UserID = @UserID 
          AND a.Active = 1 
          AND au.Active = 1 
        ORDER BY a.DueToStart ASC, pl.PriorityLevelValue DESC;
      `);

    return result.recordset;
  } catch (err) {
    console.error("Database error in getActivitiesByUser:", err);
    throw err;
  }
}

//================================================
// Get Single Activity by ID (for workspace tabs)
//================================================
async function getActivityById(activityId, userId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("ActivityID", sql.Int, activityId)
      .input("UserID", sql.Int, userId)
      .query(`
        SELECT  
            a.ActivityID, 
            a.AccountID, 
            acc.AccountName, 
            a.TypeID, 
            at.TypeName AS ActivityTypeName, 
            at.Description AS ActivityTypeDescription, 
            a.PriorityLevelID, 
            pl.PriorityLevelName, 
            pl.PriorityLevelValue, 
            a.DueToStart, 
            a.DueToEnd, 
            a.Completed, 
            a.SequenceItemID, 
            seq.SequenceID, 
            seq.SequenceName, 
            si.SequenceItemDescription, 
            si.DaysFromStart,
            a.CreatedAt AS ActivityCreated, 
            a.UpdatedAt AS ActivityUpdated, 
            a.Active AS ActivityActive 
        FROM Activity a 
        INNER JOIN AssignedUser au ON a.AccountID = au.AccountID 
        INNER JOIN Account acc ON a.AccountID = acc.AccountID 
        INNER JOIN ActivityType at ON a.TypeID = at.TypeID AND at.Active = 1 
        INNER JOIN PriorityLevel pl ON a.PriorityLevelID = pl.PriorityLevelID AND pl.Active = 1 
        LEFT JOIN SequenceItem si ON a.SequenceItemID = si.SequenceItemID 
        LEFT JOIN Sequence seq ON si.SequenceID = seq.SequenceID 
        WHERE a.ActivityID = @ActivityID
          AND au.UserID = @UserID 
          AND a.Active = 1 
          AND au.Active = 1;
      `);

    return result.recordset[0] || null;
  } catch (err) {
    console.error("Database error in getActivityById:", err);
    throw err;
  }
}

//===================
// Complete Activity
//===================
async function completeActivity(activityId, userId, notes = '') {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("ActivityID", sql.Int, activityId)
      .input("UserID", sql.Int, userId)
      .query(`
        UPDATE Activity 
        SET Completed = 1, 
            UpdatedAt = GETDATE()
        WHERE ActivityID = @ActivityID 
          AND AccountID IN (
            SELECT AccountID FROM AssignedUser 
            WHERE UserID = @UserID AND Active = 1
          )
          AND Active = 1;
          
        SELECT @@ROWCOUNT AS RowsAffected;
      `);

    return { success: result.recordset[0].RowsAffected > 0 };
  } catch (err) {
    console.error("Database error in completeActivity:", err);
    throw err;
  }
}

//============================================
// Update Activity (for editing in workspace)
//============================================
async function updateActivity(activityId, userId, updateData) {
  try {
    const pool = await sql.connect(dbConfig);
    
    let updateFields = [];
    let request = pool.request()
      .input("ActivityID", sql.Int, activityId)
      .input("UserID", sql.Int, userId);

    if (updateData.dueToStart !== undefined) {
      updateFields.push("DueToStart = @DueToStart");
      request.input("DueToStart", sql.DateTime, new Date(updateData.dueToStart));
    }

    if (updateData.dueToEnd !== undefined) {
      updateFields.push("DueToEnd = @DueToEnd");
      request.input("DueToEnd", sql.DateTime, new Date(updateData.dueToEnd));
    }

    if (updateData.priorityLevelId !== undefined) {
      updateFields.push("PriorityLevelID = @PriorityLevelID");
      request.input("PriorityLevelID", sql.Int, updateData.priorityLevelId);
    }

    if (updateFields.length === 0) {
      throw new Error("No fields to update");
    }

    updateFields.push("UpdatedAt = GETDATE()");

    const result = await request.query(`
      UPDATE Activity 
      SET ${updateFields.join(", ")}
      WHERE ActivityID = @ActivityID 
        AND AccountID IN (
          SELECT AccountID FROM AssignedUser 
          WHERE UserID = @UserID AND Active = 1
        )
        AND Active = 1;
        
      SELECT @@ROWCOUNT AS RowsAffected;
    `);

    return { success: result.recordset[0].RowsAffected > 0 };
  } catch (err) {
    console.error("Database error in updateActivity:", err);
    throw err;
  }
}

//======================
// Soft Delete Activity
//======================
async function softDeleteActivity(activityId, userId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("ActivityID", sql.Int, activityId)
      .input("UserID", sql.Int, userId)
      .query(`
        UPDATE Activity 
        SET Active = 0, 
            UpdatedAt = GETDATE()
        WHERE ActivityID = @ActivityID 
          AND AccountID IN (
            SELECT AccountID FROM AssignedUser 
            WHERE UserID = @UserID AND Active = 1
          )
          AND Active = 1;
          
        SELECT @@ROWCOUNT AS RowsAffected;
      `);

    return { success: result.recordset[0].RowsAffected > 0 };
  } catch (err) {
    console.error("Database error in softDeleteActivity:", err);
    throw err;
  }
}

//=========================================
// Get Next Activity (for workflow support)
//=========================================
async function getNextActivity(userId, currentActivityId = null) {
  try {
    const pool = await sql.connect(dbConfig);
    const request = pool.request()
      .input("UserID", sql.Int, userId);
    
    let excludeClause = "";
    if (currentActivityId) {
      request.input("CurrentActivityID", sql.Int, currentActivityId);
      excludeClause = "AND a.ActivityID != @CurrentActivityID";
    }

    const result = await request.query(`
      SELECT TOP 1
          a.ActivityID, 
          a.AccountID, 
          acc.AccountName, 
          a.TypeID, 
          at.TypeName AS ActivityTypeName, 
          at.Description AS ActivityTypeDescription, 
          a.PriorityLevelID, 
          pl.PriorityLevelName, 
          pl.PriorityLevelValue, 
          a.DueToStart, 
          a.DueToEnd, 
          a.Completed,
          a.SequenceItemID, 
          seq.SequenceID, 
          seq.SequenceName, 
          si.SequenceItemDescription, 
          si.DaysFromStart,
          a.CreatedAt AS ActivityCreated, 
          a.UpdatedAt AS ActivityUpdated, 
          a.Active AS ActivityActive 
      FROM Activity a 
      INNER JOIN AssignedUser au ON a.AccountID = au.AccountID 
      INNER JOIN Account acc ON a.AccountID = acc.AccountID 
      INNER JOIN ActivityType at ON a.TypeID = at.TypeID AND at.Active = 1 
      INNER JOIN PriorityLevel pl ON a.PriorityLevelID = pl.PriorityLevelID AND pl.Active = 1 
      LEFT JOIN SequenceItem si ON a.SequenceItemID = si.SequenceItemID 
      LEFT JOIN Sequence seq ON si.SequenceID = seq.SequenceID 
      WHERE au.UserID = @UserID 
        AND a.Active = 1 
        AND au.Active = 1 
        AND a.Completed = 0
        ${excludeClause}
      ORDER BY 
        CASE WHEN a.DueToStart < GETDATE() THEN 0 ELSE 1 END, -- Overdue first
        a.DueToStart ASC, 
        pl.PriorityLevelValue DESC;
    `);

    return result.recordset[0] || null;
  } catch (err) {
    console.error("Database error in getNextActivity:", err);
    throw err;
  }
}

//================================================
// Get Activities Summary (for dashboard widgets)
//================================================
async function getActivitiesSummary(userId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("UserID", sql.Int, userId)
      .query(`
        SELECT 
          COUNT(*) AS TotalActivities,
          SUM(CASE WHEN a.Completed = 0 THEN 1 ELSE 0 END) AS PendingActivities,
          SUM(CASE WHEN a.Completed = 1 THEN 1 ELSE 0 END) AS CompletedActivities,
          SUM(CASE WHEN a.DueToStart < GETDATE() AND a.Completed = 0 THEN 1 ELSE 0 END) AS OverdueActivities,
          SUM(CASE WHEN a.DueToStart <= DATEADD(hour, 2, GETDATE()) AND a.DueToStart >= GETDATE() AND a.Completed = 0 THEN 1 ELSE 0 END) AS UrgentActivities,
          SUM(CASE WHEN pl.PriorityLevelValue >= 8 AND a.Completed = 0 THEN 1 ELSE 0 END) AS HighPriorityActivities
        FROM Activity a 
        INNER JOIN AssignedUser au ON a.AccountID = au.AccountID 
        INNER JOIN PriorityLevel pl ON a.PriorityLevelID = pl.PriorityLevelID 
        WHERE au.UserID = @UserID 
          AND a.Active = 1 
          AND au.Active = 1;
      `);

    return result.recordset[0];
  } catch (err) {
    console.error("Database error in getActivitiesSummary:", err);
    throw err;
  }
}

//============================================
// Get Priority Levels (for activity editing)
//============================================
async function getPriorityLevels() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .query(`
        SELECT 
          PriorityLevelID,
          PriorityLevelName,
          PriorityLevelValue
        FROM PriorityLevel 
        WHERE Active = 1
        ORDER BY PriorityLevelValue DESC;
      `);

    return result.recordset;
  } catch (err) {
    console.error("Database error in getPriorityLevels:", err);
    throw err;
  }
}

//============================================
// Get Activity Types (for activity editing)
//============================================
async function getActivityTypes() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .query(`
        SELECT 
          TypeID,
          TypeName,
          Description
        FROM ActivityType 
        WHERE Active = 1
        ORDER BY TypeName;
      `);

    return result.recordset;
  } catch (err) {
    console.error("Database error in getActivityTypes:", err);
    throw err;
  }
}

//============================================
// Get Activity Context (Enhanced workspace data)
//============================================
async function getActivityContext(activityId, userId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("ActivityID", sql.Int, activityId)
      .input("UserID", sql.Int, userId)
      .query(`
        SELECT  
            a.ActivityID, 
            a.AccountID, 
            acc.AccountName, 
            a.TypeID, 
            at.TypeName AS ActivityTypeName, 
            at.Description AS ActivityTypeDescription, 
            a.PriorityLevelID, 
            pl.PriorityLevelName, 
            pl.PriorityLevelValue, 
            a.DueToStart, 
            a.DueToEnd, 
            a.Completed, 
            a.SequenceItemID, 
            seq.SequenceID, 
            seq.SequenceName, 
            seq.SequenceDescription,
            si.SequenceItemDescription, 
            si.DaysFromStart,
            a.CreatedAt AS ActivityCreated, 
            a.UpdatedAt AS ActivityUpdated, 
            a.Active AS ActivityActive,
            -- Previous sequence item
            prev_si.SequenceItemID AS PrevSequenceItemID,
            prev_si.SequenceItemDescription AS PrevSequenceItemDescription,
            prev_si.DaysFromStart AS PrevDaysFromStart,
            -- Next sequence item
            next_si.SequenceItemID AS NextSequenceItemID,
            next_si.SequenceItemDescription AS NextSequenceItemDescription,
            next_si.DaysFromStart AS NextDaysFromStart
        FROM Activity a 
        INNER JOIN AssignedUser au ON a.AccountID = au.AccountID 
        INNER JOIN Account acc ON a.AccountID = acc.AccountID 
        INNER JOIN ActivityType at ON a.TypeID = at.TypeID AND at.Active = 1 
        INNER JOIN PriorityLevel pl ON a.PriorityLevelID = pl.PriorityLevelID AND pl.Active = 1 
        LEFT JOIN SequenceItem si ON a.SequenceItemID = si.SequenceItemID 
        LEFT JOIN Sequence seq ON si.SequenceID = seq.SequenceID 
        LEFT JOIN SequenceItem prev_si ON seq.SequenceID = prev_si.SequenceID 
          AND prev_si.DaysFromStart = (si.DaysFromStart - 1)
          AND prev_si.Active = 1
        LEFT JOIN SequenceItem next_si ON seq.SequenceID = next_si.SequenceID 
          AND next_si.DaysFromStart = (si.DaysFromStart + 1)
          AND next_si.Active = 1
        WHERE a.ActivityID = @ActivityID
          AND au.UserID = @UserID 
          AND a.Active = 1 
          AND au.Active = 1;
      `);

    return result.recordset[0] || null;
  } catch (err) {
    console.error("Database error in getActivityContext:", err);
    throw err;
  }
}

// ========
// Exports
// ========
module.exports = {
  getSequencesandItemsByUser,
  getActivitiesByUser,
  getUserSequences,
  getActivityById,
  getActivityContext,
  completeActivity,
  updateActivity,
  softDeleteActivity,
  getNextActivity,
  getActivitiesSummary,
  getPriorityLevels,
  getActivityTypes
};