const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

//======================================
// SEQUENCE CRUD OPERATIONS
//======================================

//======================================
// Get all sequences
//======================================
async function getAllSequences() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .query(`
        SELECT 
          SequenceID,
          SequenceName,
          SequenceDescription,
          CreatedAt,
          UpdatedAt,
          Active
        FROM Sequence
        ORDER BY SequenceName
      `);

    return result.recordset;
  } catch (err) {
    console.error("Database error in getAllSequences:", err);
    throw err;
  }
}

//======================================
// Get sequence details by ID
//======================================
async function getSequenceDetails(id) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("SequenceID", sql.Int, id)
      .query(`
        SELECT 
          SequenceID,
          SequenceName,
          SequenceDescription,
          CreatedAt,
          UpdatedAt,
          Active
        FROM Sequence
        WHERE SequenceID = @SequenceID
      `);

    return result.recordset[0] || null;
  } catch (err) {
    console.error("Database error in getSequenceDetails:", err);
    throw err;
  }
}

//======================================
// Get sequence with all its items
//======================================
async function getSequenceWithItems(id) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("SequenceID", sql.Int, id)
      .query(`
        SELECT 
          seq.SequenceID,
          seq.SequenceName,
          seq.SequenceDescription,
          seq.CreatedAt AS SequenceCreatedAt,
          seq.UpdatedAt AS SequenceUpdatedAt,
          seq.Active AS SequenceActive,
          si.SequenceItemID,
          si.TypeID,
          at.TypeName AS ActivityTypeName,
          si.SequenceItemDescription,
          si.DaysFromStart,
          si.CreatedAt AS ItemCreatedAt,
          si.UpdatedAt AS ItemUpdatedAt,
          si.Active AS ItemActive,
          si.PriorityLevelID,
          pl.PriorityLevelName,
          pl.PriorityLevelValue
        FROM Sequence seq
        LEFT JOIN SequenceItem si ON seq.SequenceID = si.SequenceID
        LEFT JOIN ActivityType at ON si.TypeID = at.TypeID AND at.Active = 1
        LEFT JOIN PriorityLevel pl ON si.PriorityLevelID = pl.PriorityLevelID AND pl.Active = 1
        WHERE seq.SequenceID = @SequenceID
        ORDER BY si.DaysFromStart
      `);

    return result.recordset;
  } catch (err) {
    console.error("Database error in getSequenceWithItems:", err);
    throw err;
  }
}

//======================================
// Create sequence
//======================================
async function createSequence(sequenceData, changedBy) {
  try {
    const pool = await sql.connect(dbConfig);
    const {
      SequenceName,
      SequenceDescription = null,
      Active = true
    } = sequenceData;

    const result = await pool.request()
      .input("SequenceName", sql.NVarChar(255), SequenceName)
      .input("SequenceDescription", sql.NVarChar(sql.MAX), SequenceDescription)
      .input("Active", sql.Bit, Active)
      .query(`
        INSERT INTO Sequence (SequenceName, SequenceDescription, CreatedAt, UpdatedAt, Active)
        OUTPUT INSERTED.SequenceID
        VALUES (@SequenceName, @SequenceDescription, GETDATE(), GETDATE(), @Active)
      `);

    const newSequenceID = result.recordset[0].SequenceID;

    // Log the action in SequenceHistory if you have that table
    // Otherwise, you can add logging here similar to accounts

    return { SequenceID: newSequenceID };
  } catch (err) {
    console.error("Database error in createSequence:", err);
    throw err;
  }
}

//======================================
// Update sequence
//======================================
async function updateSequence(id, sequenceData, changedBy) {
  try {
    const pool = await sql.connect(dbConfig);

    // First get the existing sequence details
    const existingResult = await pool.request()
      .input("SequenceID", sql.Int, id)
      .query('SELECT * FROM Sequence WHERE SequenceID = @SequenceID');

    if (existingResult.recordset.length === 0) {
      throw new Error("Sequence not found");
    }

    const existing = existingResult.recordset[0];

    const {
      SequenceName = existing.SequenceName,
      SequenceDescription = existing.SequenceDescription
    } = sequenceData;

    await pool.request()
      .input("SequenceID", sql.Int, id)
      .input("SequenceName", sql.NVarChar(255), SequenceName)
      .input("SequenceDescription", sql.NVarChar(sql.MAX), SequenceDescription)
      .query(`
        UPDATE Sequence
        SET 
          SequenceName = @SequenceName,
          SequenceDescription = @SequenceDescription,
          UpdatedAt = GETDATE()
        WHERE SequenceID = @SequenceID
      `);

    return { message: "Sequence updated", SequenceID: id };
  } catch (err) {
    console.error("Database error in updateSequence:", err);
    throw err;
  }
}

//======================================
// Deactivate sequence
//======================================
async function deactivateSequence(id, changedBy) {
  try {
    const pool = await sql.connect(dbConfig);

    // Get existing sequence details first
    const existingResult = await pool.request()
      .input("SequenceID", sql.Int, id)
      .query('SELECT * FROM Sequence WHERE SequenceID = @SequenceID');

    if (existingResult.recordset.length === 0) {
      throw new Error("Sequence not found");
    }

    const existing = existingResult.recordset[0];

    if (!existing.Active) {
      throw new Error("Sequence is already deactivated");
    }

    // Update the sequence status
    await pool.request()
      .input("SequenceID", sql.Int, id)
      .query('UPDATE Sequence SET Active = 0, UpdatedAt = GETDATE() WHERE SequenceID = @SequenceID');

    // Also deactivate all associated sequence items
    await pool.request()
      .input("SequenceID", sql.Int, id)
      .query('UPDATE SequenceItem SET Active = 0, UpdatedAt = GETDATE() WHERE SequenceID = @SequenceID');

    return { message: "Sequence deactivated", SequenceID: id };
  } catch (err) {
    console.error("Database error in deactivateSequence:", err);
    throw err;
  }
}

//======================================
// Reactivate sequence
//======================================
async function reactivateSequence(id, changedBy) {
  try {
    const pool = await sql.connect(dbConfig);

    // Get existing sequence details first
    const existingResult = await pool.request()
      .input("SequenceID", sql.Int, id)
      .query('SELECT * FROM Sequence WHERE SequenceID = @SequenceID');

    if (existingResult.recordset.length === 0) {
      throw new Error("Sequence not found");
    }

    const existing = existingResult.recordset[0];

    if (existing.Active) {
      throw new Error("Sequence is already active");
    }

    // Update the sequence status
    await pool.request()
      .input("SequenceID", sql.Int, id)
      .query('UPDATE Sequence SET Active = 1, UpdatedAt = GETDATE() WHERE SequenceID = @SequenceID');

    return { message: "Sequence reactivated", SequenceID: id };
  } catch (err) {
    console.error("Database error in reactivateSequence:", err);
    throw err;
  }
}

//======================================
// Delete sequence (permanently)
//======================================
async function deleteSequence(id, changedBy) {
  try {
    const pool = await sql.connect(dbConfig);

    // Get existing sequence details first
    const existingResult = await pool.request()
      .input("SequenceID", sql.Int, id)
      .query('SELECT * FROM Sequence WHERE SequenceID = @SequenceID');

    if (existingResult.recordset.length === 0) {
      throw new Error("Sequence not found");
    }

    const existing = existingResult.recordset[0];

    if (existing.Active) {
      throw new Error("Sequence must be deactivated before permanent deletion");
    }

    // Delete all associated sequence items first
    await pool.request()
      .input("SequenceID", sql.Int, id)
      .query('DELETE FROM SequenceItem WHERE SequenceID = @SequenceID');

    // Then delete the sequence
    await pool.request()
      .input("SequenceID", sql.Int, id)
      .query('DELETE FROM Sequence WHERE SequenceID = @SequenceID');

    return { message: "Sequence permanently deleted", SequenceID: id };
  } catch (err) {
    console.error("Database error in deleteSequence:", err);
    throw err;
  }
}

//======================================
// SEQUENCE ITEM CRUD OPERATIONS
//======================================

//======================================
// Get sequence item details
//======================================
async function getSequenceItemDetails(id) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("SequenceItemID", sql.Int, id)
      .query(`
        SELECT 
          si.SequenceItemID,
          si.SequenceID,
          si.TypeID,
          at.TypeName AS ActivityTypeName,
          si.SequenceItemDescription,
          si.DaysFromStart,
          si.CreatedAt,
          si.UpdatedAt,
          si.Active,
          si.PriorityLevelID,
          pl.PriorityLevelName,
          pl.PriorityLevelValue
        FROM SequenceItem si
        LEFT JOIN ActivityType at ON si.TypeID = at.TypeID AND at.Active = 1
        LEFT JOIN PriorityLevel pl ON si.PriorityLevelID = pl.PriorityLevelID AND pl.Active = 1
        WHERE si.SequenceItemID = @SequenceItemID
      `);

    return result.recordset[0] || null;
  } catch (err) {
    console.error("Database error in getSequenceItemDetails:", err);
    throw err;
  }
}

//======================================
// Create sequence item
//======================================
async function createSequenceItem(itemData, changedBy) {
  try {
    const pool = await sql.connect(dbConfig);
    const {
      SequenceID,
      TypeID,
      SequenceItemDescription,
      DaysFromStart,
      PriorityLevelID,
      Active = true
    } = itemData;

    const result = await pool.request()
      .input("SequenceID", sql.Int, SequenceID)
      .input("TypeID", sql.Int, TypeID)
      .input("SequenceItemDescription", sql.NVarChar(sql.MAX), SequenceItemDescription)
      .input("DaysFromStart", sql.Int, DaysFromStart)
      .input("PriorityLevelID", sql.Int, PriorityLevelID)
      .input("Active", sql.Bit, Active)
      .query(`
        INSERT INTO SequenceItem (SequenceID, TypeID, SequenceItemDescription, CreatedAt, UpdatedAt, Active, PriorityLevelID, DaysFromStart)
        OUTPUT INSERTED.SequenceItemID
        VALUES (@SequenceID, @TypeID, @SequenceItemDescription, GETDATE(), GETDATE(), @Active, @PriorityLevelID, @DaysFromStart)
      `);

    const newItemID = result.recordset[0].SequenceItemID;

    return { SequenceItemID: newItemID };
  } catch (err) {
    console.error("Database error in createSequenceItem:", err);
    throw err;
  }
}

//======================================
// Update sequence item
//======================================
async function updateSequenceItem(id, itemData, changedBy) {
  try {
    const pool = await sql.connect(dbConfig);

    // First get the existing item details
    const existingResult = await pool.request()
      .input("SequenceItemID", sql.Int, id)
      .query('SELECT * FROM SequenceItem WHERE SequenceItemID = @SequenceItemID');

    if (existingResult.recordset.length === 0) {
      throw new Error("Sequence item not found");
    }

    const existing = existingResult.recordset[0];

    const {
      TypeID = existing.TypeID,
      SequenceItemDescription = existing.SequenceItemDescription,
      DaysFromStart = existing.DaysFromStart,
      PriorityLevelID = existing.PriorityLevelID
    } = itemData;

    await pool.request()
      .input("SequenceItemID", sql.Int, id)
      .input("TypeID", sql.Int, TypeID)
      .input("SequenceItemDescription", sql.NVarChar(sql.MAX), SequenceItemDescription)
      .input("DaysFromStart", sql.Int, DaysFromStart)
      .input("PriorityLevelID", sql.Int, PriorityLevelID)
      .query(`
        UPDATE SequenceItem
        SET 
          TypeID = @TypeID,
          SequenceItemDescription = @SequenceItemDescription,
          DaysFromStart = @DaysFromStart,
          PriorityLevelID = @PriorityLevelID,
          UpdatedAt = GETDATE()
        WHERE SequenceItemID = @SequenceItemID
      `);

    return { message: "Sequence item updated", SequenceItemID: id };
  } catch (err) {
    console.error("Database error in updateSequenceItem:", err);
    throw err;
  }
}

//======================================
// Delete sequence item
//======================================
async function deleteSequenceItem(id, changedBy) {
  try {
    const pool = await sql.connect(dbConfig);

    // Get existing item details first
    const existingResult = await pool.request()
      .input("SequenceItemID", sql.Int, id)
      .query('SELECT * FROM SequenceItem WHERE SequenceItemID = @SequenceItemID');

    if (existingResult.recordset.length === 0) {
      throw new Error("Sequence item not found");
    }

    // Soft delete by setting Active to 0
    await pool.request()
      .input("SequenceItemID", sql.Int, id)
      .query('UPDATE SequenceItem SET Active = 0, UpdatedAt = GETDATE() WHERE SequenceItemID = @SequenceItemID');

    return { message: "Sequence item deleted", SequenceItemID: id };
  } catch (err) {
    console.error("Database error in deleteSequenceItem:", err);
    throw err;
  }
}

//======================================
// ACTIVITY/WORK FUNCTIONS
//======================================

//======================================
// Get all activities with filtering
//======================================
const getActivities = async (userId, options = {}) => {
  try {
    const pool = await sql.connect(dbConfig);
    const request = pool.request().input("UserID", sql.Int, userId);
   
    let whereConditions = [
      "au.UserID = @UserID",
      "a.Active = 1",
      "au.Active = 1"
    ];
    
    // Add filters
    if (options.completed !== undefined) {
      request.input("Completed", sql.Bit, options.completed);
      whereConditions.push("a.Completed = @Completed");
    }
    
    if (options.dateFrom) {
      request.input("DateFrom", sql.DateTime, new Date(options.dateFrom));
      whereConditions.push("a.DueToStart >= @DateFrom");
    }
    
    if (options.dateTo) {
      request.input("DateTo", sql.DateTime, new Date(options.dateTo));
      whereConditions.push("a.DueToStart <= @DateTo");
    }
    
    if (options.minPriority) {
      request.input("MinPriority", sql.Int, options.minPriority);
      whereConditions.push("pl.PriorityLevelValue >= @MinPriority");
    }
    
    if (options.activityTypeId) {
      request.input("ActivityTypeId", sql.Int, options.activityTypeId);
      whereConditions.push("a.TypeID = @ActivityTypeId");
    }
    
    if (options.accountId) {
      request.input("AccountId", sql.Int, options.accountId);
      whereConditions.push("a.AccountID = @AccountId");
    }
    
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
        default: 
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
            WHEN pl.PriorityLevelValue >= 3 THEN 1
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
  } catch (error) {
    console.error("Error fetching activities:", error);
    throw error;
  }
};

//======================================
// Get activities by user
//======================================
const getActivitiesByUser = async (userId) => {
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
            seq.SequenceDescription,
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
        ORDER BY 
          CASE WHEN a.DueToStart < GETDATE() AND a.Completed = 0 THEN 0 ELSE 1 END,
          a.DueToStart ASC, 
          pl.PriorityLevelValue DESC
      `);

    return result.recordset;
  } catch (error) {
    console.error("Error fetching activities by user:", error);
    throw error;
  }
};

//======================================
// Get activity by ID with context 
//======================================
const getActivityByID = async (activityId, userId) => {
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
  } catch (error) {
    console.error("Error fetching activity by ID:", error);
    throw error;
  }
};

//======================================
// Update activity
//======================================
const updateActivity = async (activityId, userId, activityData) => {
  try {
    const pool = await sql.connect(dbConfig);
    
    let updateFields = [];
    let request = pool.request()
      .input("ActivityID", sql.Int, activityId)
      .input("UserID", sql.Int, userId);

    if (activityData.DueToStart !== undefined) {
      updateFields.push("DueToStart = @DueToStart");
      request.input("DueToStart", sql.SmallDateTime, activityData.DueToStart);
    }

    if (activityData.DueToEnd !== undefined) {
      updateFields.push("DueToEnd = @DueToEnd");
      request.input("DueToEnd", sql.SmallDateTime, activityData.DueToEnd);
    }

    if (activityData.PriorityLevelID !== undefined) {
      updateFields.push("PriorityLevelID = @PriorityLevelID");
      request.input("PriorityLevelID", sql.Int, activityData.PriorityLevelID);
    }

    if (activityData.Completed !== undefined) {
      updateFields.push("Completed = @Completed");
      request.input("Completed", sql.SmallDateTime, activityData.Completed);
    }

    await request.query(`
      UPDATE Activity 
      SET ${updateFields.join(", ")}
      WHERE ActivityID = @ActivityID 
        AND AccountID IN (
          SELECT AccountID FROM AssignedUser 
          WHERE UserID = @UserID AND Active = 1
        )
        AND Active = 1
    `);

    return true;
  } catch (error) {
    console.error("Error updating activity:", error);
    throw error;
  }
};

//======================================
// Complete activity and get next
//======================================
const completeActivityAndGetNext = async (activityId, userId) => {
  try {
    const pool = await sql.connect(dbConfig);
    
    // Complete the activity
    await pool.request()
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
          AND Active = 1
      `);

    // Get next activity
    const nextResult = await pool.request()
      .input("UserID", sql.Int, userId)
      .input("CurrentActivityID", sql.Int, activityId)
      .query(`
        SELECT TOP 1
            a.ActivityID, 
            a.AccountID, 
            acc.AccountName, 
            a.TypeID, 
            at.TypeName AS ActivityTypeName, 
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

    return {
      success: true,
      completedActivityId: activityId,
      nextActivity: nextResult.recordset[0] || null
    };
  } catch (error) {
    console.error("Error completing activity and getting next:", error);
    throw error;
  }
};

//======================================
// Soft delete activity 
//======================================
const deleteActivity = async (activityId, userId) => {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
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
          AND Active = 1
      `);

    return true;
  } catch (error) {
    console.error("Error deleting activity:", error);
    throw error;
  }
};

//======================================
// Get work dashboard summary
//======================================
const getWorkDashboardSummary = async (userId) => {
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
          SUM(CASE WHEN pl.PriorityLevelValue >= 3 AND a.Completed = 0 THEN 1 ELSE 0 END) AS HighPriorityActivities,
          SUM(CASE WHEN CAST(a.DueToStart AS DATE) = CAST(GETDATE() AS DATE) AND a.Completed = 0 THEN 1 ELSE 0 END) AS TodayActivities
        FROM Activity a 
        INNER JOIN AssignedUser au ON a.AccountID = au.AccountID 
        INNER JOIN PriorityLevel pl ON a.PriorityLevelID = pl.PriorityLevelID AND pl.Active = 1
        WHERE au.UserID = @UserID 
          AND a.Active = 1 
          AND au.Active = 1
      `);

    return result.recordset[0];
  } catch (error) {
    console.error("Error fetching work dashboard summary:", error);
    throw error;
  }
};

//======================================
// Get sequences and items by user
//======================================
const getSequencesAndItemsByUser = async (userId) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("UserID", sql.Int, userId)
      .query(`
        SELECT DISTINCT
            seq.SequenceID,
            seq.SequenceName,
            seq.SequenceDescription,
            seq.Active AS SequenceActive,
            si.SequenceItemID,
            si.SequenceItemDescription,
            si.DaysFromStart,
            si.Active AS SequenceItemActive,
            at.TypeID,
            at.TypeName AS ActivityTypeName,
            at.Description AS ActivityTypeDescription,
            pl.PriorityLevelID,
            pl.PriorityLevelName,
            pl.PriorityLevelValue,
            acc.AccountID,
            acc.AccountName
        FROM Sequence seq
        INNER JOIN SequenceItem si ON seq.SequenceID = si.SequenceID AND si.Active = 1
        INNER JOIN ActivityType at ON si.TypeID = at.TypeID AND at.Active = 1
        INNER JOIN PriorityLevel pl ON si.PriorityLevelID = pl.PriorityLevelID AND pl.Active = 1
        INNER JOIN Account acc ON seq.SequenceID = acc.SequenceID AND acc.Active = 1
        INNER JOIN AssignedUser au ON acc.AccountID = au.AccountID AND au.Active = 1
        WHERE au.UserID = @UserID
          AND seq.Active = 1
        ORDER BY seq.SequenceName, si.DaysFromStart
      `);

    return result.recordset;
  } catch (error) {
    console.error("Error fetching sequences and items by user:", error);
    throw error;
  }
};

//======================================
// Get user sequences
//======================================
const getUserSequences = async (userId) => {
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
  } catch (error) {
    console.error("Error fetching user sequences:", error);
    throw error;
  }
};

//======================================
// Get next activity
//======================================
const getNextActivity = async (userId, currentActivityId = null) => {
  try {
    const pool = await sql.connect(dbConfig);
    const request = pool.request().input("UserID", sql.Int, userId);
    
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
        CASE WHEN a.DueToStart < GETDATE() THEN 0 ELSE 1 END,
        a.DueToStart ASC, 
        pl.PriorityLevelValue DESC
    `);

    return result.recordset[0] || null;
  } catch (error) {
    console.error("Error fetching next activity:", error);
    throw error;
  }
};

//======================================
// Get activity metadata 
//======================================
const getActivityMetadata = async () => {
  try {
    const pool = await sql.connect(dbConfig);
    const [priorityResult, typeResult] = await Promise.all([
      pool.request().query(`
        SELECT 
          PriorityLevelID as id,
          PriorityLevelName as name,
          PriorityLevelValue as value
        FROM PriorityLevel 
        WHERE Active = 1
        ORDER BY PriorityLevelValue DESC
      `),
      pool.request().query(`
        SELECT 
          TypeID as id,
          TypeName as name,
          Description as description
        FROM ActivityType 
        WHERE Active = 1
        ORDER BY TypeName
      `)
    ]);

    return {
      priorityLevels: priorityResult.recordset,
      activityTypes: typeResult.recordset
    };
  } catch (error) {
    console.error("Error fetching activity metadata:", error);
    throw error;
  }
};

//======================================
// Exports
//======================================
module.exports = {
  // Sequence CRUD
  getAllSequences,
  getSequenceDetails,
  getSequenceWithItems,
  createSequence,
  updateSequence,
  deactivateSequence,
  reactivateSequence,
  deleteSequence,
  
  // Sequence Item CRUD
  getSequenceItemDetails,
  createSequenceItem,
  updateSequenceItem,
  deleteSequenceItem,
  
  // Activity/Work functions
  getActivities,
  getActivitiesByUser,
  getActivityByID,
  updateActivity,
  completeActivityAndGetNext,
  deleteActivity,
  getWorkDashboardSummary,
  getSequencesAndItemsByUser,
  getUserSequences,
  getNextActivity,
  getActivityMetadata,
};