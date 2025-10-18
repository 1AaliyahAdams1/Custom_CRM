const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

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
          si.ActivityTypeID,
          at.TypeName AS ActivityTypeName,
          si.SequenceItemDescription,
          si.DaysFromStart,
          si.CreatedAt AS ItemCreatedAt,
          si.UpdatedAt AS ItemUpdatedAt,
          si.Active AS ItemActive
        FROM Sequence seq
        LEFT JOIN SequenceItem si ON seq.SequenceID = si.SequenceID
        LEFT JOIN ActivityType at ON si.ActivityTypeID = at.TypeID AND at.Active = 1
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
          si.ActivityTypeID,
          at.TypeName AS ActivityTypeName,
          si.SequenceItemDescription,
          si.DaysFromStart,
          si.CreatedAt,
          si.UpdatedAt,
          si.Active
        FROM SequenceItem si
        LEFT JOIN ActivityType at ON si.ActivityTypeID = at.TypeID AND at.Active = 1
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
      ActivityTypeID,
      SequenceItemDescription,
      DaysFromStart,
      Active = true
    } = itemData;

    const result = await pool.request()
      .input("SequenceID", sql.Int, SequenceID)
      .input("ActivityTypeID", sql.Int, ActivityTypeID)
      .input("SequenceItemDescription", sql.NVarChar(sql.MAX), SequenceItemDescription)
      .input("DaysFromStart", sql.Int, DaysFromStart)
      .input("Active", sql.Bit, Active)
      .query(`
        INSERT INTO SequenceItem (SequenceID, ActivityTypeID, SequenceItemDescription, DaysFromStart, CreatedAt, UpdatedAt, Active)
        OUTPUT INSERTED.SequenceItemID
        VALUES (@SequenceID, @ActivityTypeID, @SequenceItemDescription, @DaysFromStart, GETDATE(), GETDATE(), @Active)
      `);

    const newItemID = result.recordset[0].SequenceItemID;

    return { SequenceItemID: newItemID };
  } catch (err) {
    console.error("Database error in createSequenceItem:", err);
    throw err;
  }
}

//======================================
// Create sequence with items (transaction)
//======================================
async function createSequenceWithItems(sequenceData, items, changedBy) {
  const transaction = new sql.Transaction();
  
  try {
    await transaction.begin();
    
    // Create the sequence
    const sequenceRequest = new sql.Request(transaction);
    const sequenceResult = await sequenceRequest
      .input("SequenceName", sql.NVarChar(255), sequenceData.SequenceName)
      .input("SequenceDescription", sql.NVarChar(sql.MAX), sequenceData.SequenceDescription || null)
      .input("Active", sql.Bit, sequenceData.Active !== undefined ? sequenceData.Active : true)
      .query(`
        INSERT INTO Sequence (SequenceName, SequenceDescription, CreatedAt, UpdatedAt, Active)
        OUTPUT INSERTED.SequenceID
        VALUES (@SequenceName, @SequenceDescription, GETDATE(), GETDATE(), @Active)
      `);

    const newSequenceID = sequenceResult.recordset[0].SequenceID;

    // Insert all sequence items
    if (items && items.length > 0) {
      for (const item of items) {
        const itemRequest = new sql.Request(transaction);
        await itemRequest
          .input("SequenceID", sql.Int, newSequenceID)
          .input("ActivityTypeID", sql.Int, item.ActivityTypeID)
          .input("SequenceItemDescription", sql.NVarChar(sql.MAX), item.SequenceItemDescription)
          .input("DaysFromStart", sql.Int, item.DaysFromStart)
          .input("Active", sql.Bit, item.Active !== undefined ? item.Active : true)
          .query(`
            INSERT INTO SequenceItem (SequenceID, ActivityTypeID, SequenceItemDescription, DaysFromStart, CreatedAt, UpdatedAt, Active)
            VALUES (@SequenceID, @ActivityTypeID, @SequenceItemDescription, @DaysFromStart, GETDATE(), GETDATE(), @Active)
          `);
      }
    }

    await transaction.commit();
    return { SequenceID: newSequenceID };
  } catch (err) {
    await transaction.rollback();
    console.error("Database error in createSequenceWithItems:", err);
    throw err;
  }
}

//======================================
// Assign sequence to account
//======================================
async function assignSequenceToAccount(accountId, sequenceId, changedBy) {
  try {
    const pool = await sql.connect(dbConfig);
    
    // Verify both account and sequence exist and are active
    const verifyResult = await pool.request()
      .input("AccountID", sql.Int, accountId)
      .input("SequenceID", sql.Int, sequenceId)
      .query(`
        SELECT 
          (SELECT COUNT(*) FROM Account WHERE AccountID = @AccountID AND Active = 1) AS AccountExists,
          (SELECT COUNT(*) FROM Sequence WHERE SequenceID = @SequenceID AND Active = 1) AS SequenceExists
      `);

    const { AccountExists, SequenceExists } = verifyResult.recordset[0];
    
    if (!AccountExists) {
      throw new Error("Account not found or inactive");
    }
    if (!SequenceExists) {
      throw new Error("Sequence not found or inactive");
    }

    // Update the account with the sequence
    await pool.request()
      .input("AccountID", sql.Int, accountId)
      .input("SequenceID", sql.Int, sequenceId)
      .query(`
        UPDATE Account 
        SET SequenceID = @SequenceID, UpdatedAt = GETDATE()
        WHERE AccountID = @AccountID
      `);

    return { message: "Sequence assigned to account", AccountID: accountId, SequenceID: sequenceId };
  } catch (err) {
    console.error("Database error in assignSequenceToAccount:", err);
    throw err;
  }
}

//======================================
// Unassign sequence from account
//======================================
async function unassignSequenceFromAccount(accountId, changedBy) {
  try {
    const pool = await sql.connect(dbConfig);
    
    await pool.request()
      .input("AccountID", sql.Int, accountId)
      .query(`
        UPDATE Account 
        SET SequenceID = NULL, UpdatedAt = GETDATE()
        WHERE AccountID = @AccountID
      `);

    return { message: "Sequence unassigned from account", AccountID: accountId };
  } catch (err) {
    console.error("Database error in unassignSequenceFromAccount:", err);
    throw err;
  }
}

//======================================
// Get all sequence items
//======================================
async function getAllSequenceItems() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .query(`
        SELECT 
          si.SequenceItemID,
          si.SequenceID,          -- ⭐ THIS IS THE KEY FIELD THAT WAS MISSING
          si.ActivityTypeID,
          at.TypeName AS ActivityTypeName,
          si.SequenceItemDescription,
          si.DaysFromStart,
          si.CreatedAt,
          si.UpdatedAt,
          si.Active
        FROM SequenceItem si
        LEFT JOIN ActivityType at ON si.ActivityTypeID = at.TypeID AND at.Active = 1
        ORDER BY si.SequenceID, si.DaysFromStart
      `);

    return result.recordset;
  } catch (err) {
    console.error("Database error in getAllSequenceItems:", err);
    throw err;
  }
}

//======================================
// Get accounts by sequence
//======================================
async function getAccountsBySequence(sequenceId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("SequenceID", sql.Int, sequenceId)
      .query(`
        SELECT 
          a.AccountID,
          a.AccountName,
          a.SequenceID,
          a.CreatedAt,
          a.Active
        FROM Account a
        WHERE a.SequenceID = @SequenceID
        ORDER BY a.AccountName
      `);

    return result.recordset;
  } catch (err) {
    console.error("Database error in getAccountsBySequence:", err);
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
      ActivityTypeID = existing.ActivityTypeID,
      SequenceItemDescription = existing.SequenceItemDescription,
      DaysFromStart = existing.DaysFromStart
    } = itemData;

    await pool.request()
      .input("SequenceItemID", sql.Int, id)
      .input("ActivityTypeID", sql.Int, ActivityTypeID)
      .input("SequenceItemDescription", sql.NVarChar(sql.MAX), SequenceItemDescription)
      .input("DaysFromStart", sql.Int, DaysFromStart)
      .query(`
        UPDATE SequenceItem
        SET 
          ActivityTypeID = @ActivityTypeID,
          SequenceItemDescription = @SequenceItemDescription,
          DaysFromStart = @DaysFromStart,
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
// WORK Page
//======================================

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
            acc.PrimaryPhone as AccountPhone,
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
              WHEN ISNULL(pl.PriorityLevelValue, 0) >= 8 THEN 1
              ELSE 0
            END AS IsHighPriority
        FROM Activity a 
        INNER JOIN AssignedUser au ON a.AccountID = au.AccountID 
        INNER JOIN Account acc ON a.AccountID = acc.AccountID 
        LEFT JOIN ActivityType at ON a.TypeID = at.TypeID AND at.Active = 1 
        LEFT JOIN PriorityLevel pl ON a.PriorityLevelID = pl.PriorityLevelID AND pl.Active = 1 
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
          AND acc.Active = 1
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
      request.input("Completed", sql.Bit, activityData.Completed);
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
        LEFT JOIN ActivityType at ON a.TypeID = at.TypeID AND at.Active = 1 
        LEFT JOIN PriorityLevel pl ON a.PriorityLevelID = pl.PriorityLevelID AND pl.Active = 1 
        LEFT JOIN SequenceItem si ON a.SequenceItemID = si.SequenceItemID AND si.Active = 1
        LEFT JOIN Sequence seq ON si.SequenceID = seq.SequenceID AND seq.Active = 1
        WHERE au.UserID = @UserID 
          AND a.Active = 1 
          AND au.Active = 1 
          AND acc.Active = 1
          AND a.Completed = 0
          AND a.ActivityID != @CurrentActivityID
        ORDER BY 
          CASE WHEN a.DueToStart < GETDATE() THEN 0 ELSE 1 END,
          a.DueToStart ASC, 
          ISNULL(pl.PriorityLevelValue, 0) DESC
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
          SUM(CASE WHEN ISNULL(pl.PriorityLevelValue, 0) >= 3 AND a.Completed = 0 THEN 1 ELSE 0 END) AS HighPriorityActivities,
          SUM(CASE WHEN CAST(a.DueToStart AS DATE) = CAST(GETDATE() AS DATE) AND a.Completed = 0 THEN 1 ELSE 0 END) AS TodayActivities
        FROM Activity a 
        INNER JOIN AssignedUser au ON a.AccountID = au.AccountID 
        LEFT JOIN PriorityLevel pl ON a.PriorityLevelID = pl.PriorityLevelID AND pl.Active = 1
        WHERE au.UserID = @UserID 
          AND a.Active = 1 
          AND au.Active = 1
          AND acc.Active = 1
      `);

    return result.recordset[0];
  } catch (error) {
    console.error("Error fetching work dashboard summary:", error);
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
      LEFT JOIN ActivityType at ON a.TypeID = at.TypeID AND at.Active = 1 
      LEFT JOIN PriorityLevel pl ON a.PriorityLevelID = pl.PriorityLevelID AND pl.Active = 1 
      LEFT JOIN SequenceItem si ON a.SequenceItemID = si.SequenceItemID AND si.Active = 1
      LEFT JOIN Sequence seq ON si.SequenceID = seq.SequenceID AND seq.Active = 1
      WHERE au.UserID = @UserID 
        AND a.Active = 1 
        AND au.Active = 1
        AND acc.Active = 1 
        AND a.Completed = 0
        ${excludeClause}
      ORDER BY 
        CASE WHEN a.DueToStart < GETDATE() THEN 0 ELSE 1 END,
        a.DueToStart ASC, 
        ISNULL(pl.PriorityLevelValue, 0) DESC
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
// Get all activity types
//======================================
async function getAllActivityTypes() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .query(`
        SELECT 
          TypeID,
          TypeName,
          Description,
          Active
        FROM ActivityType
        WHERE Active = 1
        ORDER BY TypeName
      `);

    return result.recordset;
  } catch (err) {
    console.error("Database error in getAllActivityTypes:", err);
    throw err;
  }
}

//======================================
// Get activities for work page (due today or overdue)
//======================================
const getWorkPageActivities = async (userId) => {
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
            CASE 
              WHEN a.Completed = 1 THEN 'completed'
              WHEN a.DueToStart < GETDATE() THEN 'overdue'
              WHEN CAST(a.DueToStart AS DATE) = CAST(GETDATE() AS DATE) THEN 'today'
              ELSE 'upcoming'
            END AS Status,
            CASE 
              WHEN a.DueToStart < GETDATE() AND a.Completed = 0 THEN 1
              ELSE 0
            END AS IsOverdue
        FROM Activity a 
        INNER JOIN AssignedUser au ON a.AccountID = au.AccountID 
        INNER JOIN Account acc ON a.AccountID = acc.AccountID 
        LEFT JOIN ActivityType at ON a.TypeID = at.TypeID AND at.Active = 1 
        LEFT JOIN PriorityLevel pl ON a.PriorityLevelID = pl.PriorityLevelID AND pl.Active = 1  
        LEFT JOIN SequenceItem si ON a.SequenceItemID = si.SequenceItemID AND si.Active = 1
        LEFT JOIN Sequence seq ON si.SequenceID = seq.SequenceID AND seq.Active = 1
        WHERE au.UserID = @UserID 
          AND a.Active = 1 
          AND au.Active = 1
          AND acc.Active = 1
          AND a.Completed = 0
          AND CAST(a.DueToStart AS DATE) <= CAST(GETDATE() AS DATE)
        ORDER BY 
          CASE WHEN a.DueToStart < GETDATE() THEN 0 ELSE 1 END,
          a.DueToStart ASC,
          ISNULL(pl.PriorityLevelValue, 0) DESC
      `);

    return result.recordset;
  } catch (error) {
    console.error("Error fetching work page activities:", error);
    throw error;
  }
};

//======================================
// Get account activities grouped view (for workspace tab)
//======================================
const getAccountActivitiesGrouped = async (accountId, userId) => {
  try {
    const pool = await sql.connect(dbConfig);
    
    // Verify access
    const accessCheck = await pool.request()
      .input("UserID", sql.Int, userId)
      .input("AccountID", sql.Int, accountId)
      .query(`
        SELECT COUNT(*) AS HasAccess
        FROM AssignedUser
        WHERE UserID = @UserID AND AccountID = @AccountID AND Active = 1
      `);

    if (accessCheck.recordset[0].HasAccess === 0) {
      throw new Error("User does not have access to this account");
    }

    // Get account and sequence info
    const accountInfo = await pool.request()
      .input("AccountID", sql.Int, accountId)
      .query(`
        SELECT 
          acc.AccountID,
          acc.AccountName,
          acc.PrimaryPhone,
          acc.CreatedAt AS AccountCreatedAt,
          seq.SequenceID,
          seq.SequenceName,
          seq.SequenceDescription
        FROM Account acc
        LEFT JOIN Sequence seq ON acc.SequenceID = seq.SequenceID AND seq.Active = 1
        WHERE acc.AccountID = @AccountID AND acc.Active = 1
      `);

    if (accountInfo.recordset.length === 0) {
      throw new Error("Account not found");
    }

    const account = accountInfo.recordset[0];

    // Get all activities for this account
    const activitiesResult = await pool.request()
      .input("AccountID", sql.Int, accountId)
      .query(`
        SELECT  
            a.ActivityID, 
            a.AccountID, 
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
            si.SequenceItemDescription, 
            si.DaysFromStart,
            a.Active AS ActivityActive,
            CASE 
              WHEN a.Completed = 1 THEN 'completed'
              WHEN a.DueToStart < GETDATE() THEN 'overdue'
              WHEN CAST(a.DueToStart AS DATE) = CAST(GETDATE() AS DATE) THEN 'today'
              ELSE 'upcoming'
            END AS Status
        FROM Activity a 
        LEFT JOIN ActivityType at ON a.TypeID = at.TypeID AND at.Active = 1 
        LEFT JOIN PriorityLevel pl ON a.PriorityLevelID = pl.PriorityLevelID AND pl.Active = 1  
        LEFT JOIN SequenceItem si ON a.SequenceItemID = si.SequenceItemID AND si.Active = 1
        WHERE a.AccountID = @AccountID AND a.Active = 1
        ORDER BY a.DueToStart ASC
      `);

    const allActivities = activitiesResult.recordset;
    
    // Split into three groups
    const previousActivities = allActivities
      .filter(a => a.Completed === true)
      .sort((a, b) => new Date(b.CompletedAt) - new Date(a.CompletedAt));
const today = new Date();
today.setHours(0, 0, 0, 0); // Start of today

const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1); // Start of tomorrow

// Current = due today or earlier (not completed)
const currentActivities = allActivities
  .filter(a => {
    if (a.Completed) return false;
    const dueDate = new Date(a.DueToStart);
    dueDate.setHours(0, 0, 0, 0); // Compare dates only
    return dueDate < tomorrow; // Due today or earlier
  });

// Upcoming = due after today (not completed)
const upcomingActivities = allActivities
  .filter(a => {
    if (a.Completed) return false;
    const dueDate = new Date(a.DueToStart);
    dueDate.setHours(0, 0, 0, 0); // Compare dates only
    return dueDate >= tomorrow; // Due tomorrow or later
  });
    return {
      account: {
        AccountID: account.AccountID,
        AccountName: account.AccountName,
        PrimaryPhone: account.PrimaryPhone,
        AccountCreatedAt: account.AccountCreatedAt
      },
      sequence: account.SequenceID ? {
        SequenceID: account.SequenceID,
        SequenceName: account.SequenceName,
        SequenceDescription: account.SequenceDescription
      } : null,
      previousActivities,
      currentActivities,
      upcomingActivities,
      totalActivities: allActivities.length,
      completedCount: previousActivities.length,
      pendingCount: currentActivities.length + upcomingActivities.length
    };
  } catch (err) {
    console.error("Database error in getAccountActivitiesGrouped:", err);
    throw err;
  }
};

//======================================
// Update activity due date and cascade to subsequent activities
//======================================
const updateActivityDueDateWithCascade = async (activityId, userId, newDueDate) => {
  const transaction = new sql.Transaction();
  
  try {
    await transaction.begin();
    
    // Get the activity details and its sequence context
    const activityRequest = new sql.Request(transaction);
    const activityResult = await activityRequest
      .input("ActivityID", sql.Int, activityId)
      .input("UserID", sql.Int, userId)
      .query(`
        SELECT 
          a.ActivityID,
          a.AccountID,
          a.SequenceItemID,
          a.DueToStart,
          si.DaysFromStart,
          si.SequenceID
        FROM Activity a
        INNER JOIN AssignedUser au ON a.AccountID = au.AccountID
        LEFT JOIN SequenceItem si ON a.SequenceItemID = si.SequenceItemID
        WHERE a.ActivityID = @ActivityID 
          AND au.UserID = @UserID 
          AND au.Active = 1
          AND a.Active = 1
      `);

    if (activityResult.recordset.length === 0) {
      throw new Error("Activity not found or access denied");
    }

    const activity = activityResult.recordset[0];
    
    // Update the current activity (removed UpdatedAt)
    const updateRequest = new sql.Request(transaction);
    await updateRequest
      .input("ActivityID", sql.Int, activityId)
      .input("NewDueDate", sql.SmallDateTime, newDueDate)
      .query(`
        UPDATE Activity 
        SET DueToStart = @NewDueDate
        WHERE ActivityID = @ActivityID
      `);

    // If part of a sequence, cascade update to subsequent activities
    if (activity.SequenceItemID && activity.SequenceID) {
      const oldDueDate = new Date(activity.DueToStart);
      const newDueDateObj = new Date(newDueDate);
      const daysDiff = Math.round((newDueDateObj - oldDueDate) / (1000 * 60 * 60 * 24));

      if (daysDiff !== 0) {
        // Get all subsequent activities in the sequence for this account
        const subsequentRequest = new sql.Request(transaction);
        const subsequentResult = await subsequentRequest
          .input("AccountID", sql.Int, activity.AccountID)
          .input("SequenceID", sql.Int, activity.SequenceID)
          .input("CurrentDaysFromStart", sql.Int, activity.DaysFromStart)
          .query(`
            SELECT a.ActivityID, a.DueToStart
            FROM Activity a
            INNER JOIN SequenceItem si ON a.SequenceItemID = si.SequenceItemID
            WHERE a.AccountID = @AccountID
              AND si.SequenceID = @SequenceID
              AND si.DaysFromStart > @CurrentDaysFromStart
              AND a.Active = 1
              AND a.Completed = 0
            ORDER BY si.DaysFromStart
          `);

        // Update each subsequent activity
        for (const subActivity of subsequentResult.recordset) {
          const currentDue = new Date(subActivity.DueToStart);
          currentDue.setDate(currentDue.getDate() + daysDiff);
          
          const cascadeRequest = new sql.Request(transaction);
          await cascadeRequest
            .input("ActivityID", sql.Int, subActivity.ActivityID)
            .input("NewDueDate", sql.SmallDateTime, currentDue)
            .query(`
              UPDATE Activity 
              SET DueToStart = @NewDueDate
              WHERE ActivityID = @ActivityID
            `);
        }
      }
    }

    await transaction.commit();
    return { success: true, message: "Activity due date updated successfully" };
  } catch (err) {
    await transaction.rollback();
    console.error("Database error in updateActivityDueDateWithCascade:", err);
    throw err;
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
  createSequenceWithItems,
  getAllSequenceItems,

  // Sequence-Account Relationship
  assignSequenceToAccount,
  unassignSequenceFromAccount,
  getAccountsBySequence,
  getAllActivityTypes,
  
  // Activity Types
  getAllActivityTypes,

  // Work page
  getWorkPageActivities,
  getAccountActivitiesGrouped,
  getActivityByID,
  updateActivity,
  updateActivityDueDateWithCascade,
  completeActivityAndGetNext,
  deleteActivity,
  getWorkDashboardSummary,
  getNextActivity,
  getActivityMetadata,
};