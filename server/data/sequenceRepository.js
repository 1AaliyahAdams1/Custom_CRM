const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

//============================================
// Get Activities with Flexible Filtering and Sorting
//============================================
async function getActivities(userId, options = {}) {
  try {
    const pool = await sql.connect(dbConfig);
    const request = pool.request().input("UserID", sql.Int, userId);
    
    // Build WHERE clause based on filters
    let whereConditions = [
      "au.UserID = @UserID",
      "a.Active = 1",
      "au.Active = 1"
    ];
    
    // Filter by completion status
    if (options.completed !== undefined) {
      request.input("Completed", sql.Bit, options.completed);
      whereConditions.push("a.Completed = @Completed");
    }
    
    // Filter by date range
    if (options.dateFrom) {
      request.input("DateFrom", sql.DateTime, new Date(options.dateFrom));
      whereConditions.push("a.DueToStart >= @DateFrom");
    }
    
    if (options.dateTo) {
      request.input("DateTo", sql.DateTime, new Date(options.dateTo));
      whereConditions.push("a.DueToStart <= @DateTo");
    }
    
    // Filter by priority level
    if (options.minPriority) {
      request.input("MinPriority", sql.Int, options.minPriority);
      whereConditions.push("pl.PriorityLevelValue >= @MinPriority");
    }
    
    // Filter by activity type
    if (options.activityTypeId) {
      request.input("ActivityTypeId", sql.Int, options.activityTypeId);
      whereConditions.push("a.TypeID = @ActivityTypeId");
    }
    
    // Filter by account
    if (options.accountId) {
      request.input("AccountId", sql.Int, options.accountId);
      whereConditions.push("a.AccountID = @AccountId");
    }
    
    // Build ORDER BY clause
    let orderBy = "a.DueToStart ASC, pl.PriorityLevelValue DESC";
    
    if (options.sortBy) {
      switch (options.sortBy) {
        case 'priority':
          orderBy = "CASE WHEN a.DueToStart < GETDATE() AND a.Completed = 0 THEN 0 ELSE 1 END, pl.PriorityLevelValue DESC, a.DueToStart ASC";
          break;
        case 'account':
          orderBy = "acc.AccountName ASC, a.DueToStart ASC";
          break;
        case 'type':
          orderBy = "at.TypeName ASC, a.DueToStart ASC";
          break;
        case 'sequence':
          orderBy = "seq.SequenceName ASC, si.DaysFromStart ASC, a.DueToStart ASC";
          break;
        case 'status':
          orderBy = "CASE WHEN a.DueToStart < GETDATE() AND a.Completed = 0 THEN 0 WHEN a.DueToStart <= DATEADD(hour, 2, GETDATE()) AND a.Completed = 0 THEN 1 ELSE 2 END, a.DueToStart ASC";
          break;
        default: // 'dueDate'
          orderBy = "CASE WHEN a.DueToStart < GETDATE() AND a.Completed = 0 THEN 0 ELSE 1 END, a.DueToStart ASC, pl.PriorityLevelValue DESC";
      }
    }
    
    const result = await request.query(`
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
          a.Active AS ActivityActive,
          -- Calculated fields for status
          CASE 
            WHEN a.Completed = 1 THEN 'completed'
            WHEN a.DueToStart < GETDATE() THEN 'overdue'
            WHEN a.DueToStart <= DATEADD(hour, 2, GETDATE()) THEN 'urgent'
            ELSE 'normal'
          END AS Status,
          CASE 
            WHEN a.DueToStart < GETDATE() AND a.Completed = 0 THEN 1
            ELSE 0
          END AS IsOverdue,
          CASE 
            WHEN a.DueToStart <= DATEADD(hour, 2, GETDATE()) AND a.DueToStart >= GETDATE() AND a.Completed = 0 THEN 1
            ELSE 0
          END AS IsUrgent,
          CASE 
            WHEN pl.PriorityLevelValue >= 8 THEN 1
            ELSE 0
          END AS IsHighPriority
      FROM Activity a 
      INNER JOIN AssignedUser au ON a.AccountID = au.AccountID 
      INNER JOIN Account acc ON a.AccountID = acc.AccountID 
      INNER JOIN ActivityType at ON a.TypeID = at.TypeID AND at.Active = 1 
      INNER JOIN PriorityLevel pl ON a.PriorityLevelID = pl.PriorityLevelID AND pl.Active = 1 
      LEFT JOIN SequenceItem si ON a.SequenceItemID = si.SequenceItemID AND si.Active = 1
      LEFT JOIN Sequence seq ON si.SequenceID = seq.SequenceID AND seq.Active = 1
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY ${orderBy}
    `);

    return result.recordset;
  } catch (err) {
    console.error("Database error in getActivities:", err);
    throw err;
  }
}

//============================================
// Get Single Activity with Full Context
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
            a.Active AS ActivityActive,
            -- Previous sequence item
            prev_si.SequenceItemID AS PrevSequenceItemID,
            prev_si.SequenceItemDescription AS PrevSequenceItemDescription,
            prev_si.DaysFromStart AS PrevDaysFromStart,
            -- Next sequence item
            next_si.SequenceItemID AS NextSequenceItemID,
            next_si.SequenceItemDescription AS NextSequenceItemDescription,
            next_si.DaysFromStart AS NextDaysFromStart,
            -- Status calculations
            CASE 
              WHEN a.Completed = 1 THEN 'completed'
              WHEN a.DueToStart < GETDATE() THEN 'overdue'
              WHEN a.DueToStart <= DATEADD(hour, 2, GETDATE()) THEN 'urgent'
              ELSE 'normal'
            END AS Status,
            CASE 
              WHEN a.DueToStart < GETDATE() AND a.Completed = 0 THEN 1
              ELSE 0
            END AS IsOverdue,
            CASE 
              WHEN a.DueToStart <= DATEADD(hour, 2, GETDATE()) AND a.DueToStart >= GETDATE() AND a.Completed = 0 THEN 1
              ELSE 0
            END AS IsUrgent,
            CASE 
              WHEN pl.PriorityLevelValue >= 8 THEN 1
              ELSE 0
            END AS IsHighPriority
        FROM Activity a 
        INNER JOIN AssignedUser au ON a.AccountID = au.AccountID 
        INNER JOIN Account acc ON a.AccountID = acc.AccountID 
        INNER JOIN ActivityType at ON a.TypeID = at.TypeID AND at.Active = 1 
        INNER JOIN PriorityLevel pl ON a.PriorityLevelID = pl.PriorityLevelID AND pl.Active = 1 
        LEFT JOIN SequenceItem si ON a.SequenceItemID = si.SequenceItemID AND si.Active = 1
        LEFT JOIN Sequence seq ON si.SequenceID = seq.SequenceID AND seq.Active = 1
        LEFT JOIN SequenceItem prev_si ON seq.SequenceID = prev_si.SequenceID 
          AND prev_si.DaysFromStart = (si.DaysFromStart - 1)
          AND prev_si.Active = 1
        LEFT JOIN SequenceItem next_si ON seq.SequenceID = next_si.SequenceID 
          AND next_si.DaysFromStart = (si.DaysFromStart + 1)
          AND next_si.Active = 1
        WHERE a.ActivityID = @ActivityID
          AND au.UserID = @UserID 
          AND a.Active = 1 
          AND au.Active = 1
      `);

    return result.recordset[0] || null;
  } catch (err) {
    console.error("Database error in getActivityContext:", err);
    throw err;
  }
}

//================================================
// Get Work Dashboard Summary
//================================================
async function getWorkDashboardSummary(userId) {
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
          SUM(CASE WHEN pl.PriorityLevelValue >= 8 AND a.Completed = 0 THEN 1 ELSE 0 END) AS HighPriorityActivities,
          SUM(CASE WHEN CAST(a.DueToStart AS DATE) = CAST(GETDATE() AS DATE) AND a.Completed = 0 THEN 1 ELSE 0 END) AS TodayActivities
        FROM Activity a 
        INNER JOIN AssignedUser au ON a.AccountID = au.AccountID 
        INNER JOIN PriorityLevel pl ON a.PriorityLevelID = pl.PriorityLevelID AND pl.Active = 1
        WHERE au.UserID = @UserID 
          AND a.Active = 1 
          AND au.Active = 1
      `);

    return result.recordset[0];
  } catch (err) {
    console.error("Database error in getWorkDashboardSummary:", err);
    throw err;
  }
}

//=========================================
// Get Next Activity for Workflow
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
          a.Active AS ActivityActive,
          -- Status calculations
          CASE 
            WHEN a.Completed = 1 THEN 'completed'
            WHEN a.DueToStart < GETDATE() THEN 'overdue'
            WHEN a.DueToStart <= DATEADD(hour, 2, GETDATE()) THEN 'urgent'
            ELSE 'normal'
          END AS Status
      FROM Activity a 
      INNER JOIN AssignedUser au ON a.AccountID = au.AccountID 
      INNER JOIN Account acc ON a.AccountID = acc.AccountID 
      INNER JOIN ActivityType at ON a.TypeID = at.TypeID AND at.Active = 1 
      INNER JOIN PriorityLevel pl ON a.PriorityLevelID = pl.PriorityLevelID AND pl.Active = 1 
      LEFT JOIN SequenceItem si ON a.SequenceItemID = si.SequenceItemID AND si.Active = 1
      LEFT JOIN Sequence seq ON si.SequenceID = seq.SequenceID AND seq.Active = 1
      WHERE au.UserID = @UserID 
        AND a.Active = 1 
        AND au.Active = 1 
        AND a.Completed = 0
        ${excludeClause}
      ORDER BY 
        CASE WHEN a.DueToStart < GETDATE() THEN 0 ELSE 1 END, -- Overdue first
        a.DueToStart ASC, 
        pl.PriorityLevelValue DESC
    `);

    return result.recordset[0] || null;
  } catch (err) {
    console.error("Database error in getNextActivity:", err);
    throw err;
  }
}

//===================
// Complete Activity and Get Next
//===================
async function completeActivityAndGetNext(activityId, userId, notes = '') {
  try {
    const pool = await sql.connect(dbConfig);
    
    // Start transaction
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    
    try {
      // Complete the activity
      const completeResult = await transaction.request()
        .input("ActivityID", sql.Int, activityId)
        .input("UserID", sql.Int, userId)
        .query(`
          UPDATE Activity 
          SET Completed = 1
          WHERE ActivityID = @ActivityID 
            AND AccountID IN (
              SELECT AccountID FROM AssignedUser 
              WHERE UserID = @UserID AND Active = 1
            )
            AND Active = 1;
            
          SELECT @@ROWCOUNT AS RowsAffected;
        `);

      if (completeResult.recordset[0].RowsAffected === 0) {
        await transaction.rollback();
        return { success: false, error: "Activity not found or already completed" };
      }

      // Get next activity
      const nextResult = await transaction.request()
        .input("UserID", sql.Int, userId)
        .input("CurrentActivityID", sql.Int, activityId)
        .query(`
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
              -- Status calculations
              CASE 
                WHEN a.Completed = 1 THEN 'completed'
                WHEN a.DueToStart < GETDATE() THEN 'overdue'
                WHEN a.DueToStart <= DATEADD(hour, 2, GETDATE()) THEN 'urgent'
                ELSE 'normal'
              END AS Status
          FROM Activity a 
          INNER JOIN AssignedUser au ON a.AccountID = au.AccountID 
          INNER JOIN Account acc ON a.AccountID = acc.AccountID 
          INNER JOIN ActivityType at ON a.TypeID = at.TypeID AND at.Active = 1 
          INNER JOIN PriorityLevel pl ON a.PriorityLevelID = pl.PriorityLevelID AND pl.Active = 1 
          LEFT JOIN SequenceItem si ON a.SequenceItemID = si.SequenceItemID AND si.Active = 1
          LEFT JOIN Sequence seq ON si.SequenceID = seq.SequenceID AND seq.Active = 1
          WHERE au.UserID = @UserID 
            AND a.Active = 1 
            AND au.Active = 1 
            AND a.Completed = 0
            AND a.ActivityID != @CurrentActivityID
          ORDER BY 
            CASE WHEN a.DueToStart < GETDATE() THEN 0 ELSE 1 END,
            a.DueToStart ASC, 
            pl.PriorityLevelValue DESC
        `);

      await transaction.commit();
      
      return {
        success: true,
        completedActivityId: activityId,
        nextActivity: nextResult.recordset[0] || null
      };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error("Database error in completeActivityAndGetNext:", err);
    throw err;
  }
}

//============================================
// Update Activity
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
        SET Active = 0
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

//============================================
// Get User Sequences for Context
//============================================
async function getUserSequences(userId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("UserID", sql.Int, userId)
      .query(`
        SELECT DISTINCT
            u.UserID, 
            u.Username, 
            acc.AccountID, 
            acc.AccountName, 
            seq.SequenceID, 
            seq.SequenceName, 
            seq.SequenceDescription, 
            seq.Active AS SequenceActive 
        FROM AssignedUser au 
        INNER JOIN Users u ON au.UserID = u.UserID 
        INNER JOIN Account acc ON au.AccountID = acc.AccountID 
        INNER JOIN Sequence seq ON acc.SequenceID = seq.SequenceID 
        WHERE u.UserID = @UserID 
          AND au.Active = 1 
          AND acc.Active = 1 
          AND seq.Active = 1 
        ORDER BY acc.AccountName, seq.SequenceName
      `);

    return result.recordset;
  } catch (err) {
    console.error("Database error in getUserSequences:", err);
    throw err;
  }
}

//============================================
// Get Activity Metadata
//============================================
async function getActivityMetadata() {
  try {
    const pool = await sql.connect(dbConfig);
    const [priorityResult, typeResult] = await Promise.all([
      pool.request().query(`
        SELECT 
          PriorityLevelID,
          PriorityLevelName,
          PriorityLevelValue
        FROM PriorityLevel 
        WHERE Active = 1
        ORDER BY PriorityLevelValue DESC
      `),
      pool.request().query(`
        SELECT 
          TypeID,
          TypeName,
          Description
        FROM ActivityType 
        WHERE Active = 1
        ORDER BY TypeName
      `)
    ]);

    return {
      priorityLevels: priorityResult.recordset,
      activityTypes: typeResult.recordset
    };
  } catch (err) {
    console.error("Database error in getActivityMetadata:", err);
    throw err;
  }
}

// ========
// Exports
// ========
module.exports = {
  getActivities,
  getActivityContext,
  getWorkDashboardSummary,
  getNextActivity,
  completeActivityAndGetNext,
  updateActivity,
  softDeleteActivity,
  getUserSequences,
  getActivityMetadata
};