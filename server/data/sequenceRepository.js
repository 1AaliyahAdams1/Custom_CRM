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
          si.ActivityTypeID,
          at.TypeName AS ActivityTypeName,
          si.SequenceItemDescription,
          si.DaysFromStart,
          si.CreatedAt,
          si.UpdatedAt,
          si.Active
          si.Active
        FROM SequenceItem si
        LEFT JOIN ActivityType at ON si.ActivityTypeID = at.TypeID AND at.Active = 1
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
      .input("ActivityTypeID", sql.Int, ActivityTypeID)
      .input("SequenceItemDescription", sql.NVarChar(sql.MAX), SequenceItemDescription)
      .input("DaysFromStart", sql.Int, DaysFromStart)
      .query(`
        UPDATE SequenceItem
        SET 
          ActivityTypeID = @ActivityTypeID,
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
// ACTIVITY/WORK FUNCTIONS
//======================================

//=======================
// Get all activities
//=======================
const getActivities = async (userId, options = {}) => {
  try {
    const pool = await sql.connect(dbConfig);
    const request = pool.request().input("UserID", sql.Int, userId);
   
    let whereConditions = [
      "au.UserID = @UserID",
      "a.Active = 1",
      "au.Active = 1"
    ];
    
    // filters
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
    
    let orderBy = "a.DueToStart ASC, ISNULL(pl.PriorityLevelValue, 0) DESC";
    
    if (options.sortBy) {
      switch (options.sortBy) {
        case 'priority':
          orderBy = "CASE WHEN a.DueToStart < GETDATE() AND a.Completed = 0 THEN 0 ELSE 1 END, ISNULL(pl.PriorityLevelValue, 0) DESC, a.DueToStart ASC";
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
          orderBy = "CASE WHEN a.DueToStart < GETDATE() AND a.Completed = 0 THEN 0 ELSE 1 END, a.DueToStart ASC, ISNULL(pl.PriorityLevelValue, 0) DESC";
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
            WHEN ISNULL(pl.PriorityLevelValue, 0) >= 3 THEN 1
            ELSE 0
          END AS IsHighPriority
      FROM Activity a 
      INNER JOIN AssignedUser au ON a.AccountID = au.AccountID 
      INNER JOIN Account acc ON a.AccountID = acc.AccountID 
      LEFT JOIN ActivityType at ON a.TypeID = at.TypeID AND at.Active = 1 
      LEFT JOIN PriorityLevel pl ON a.PriorityLevelID = pl.PriorityLevelID AND pl.Active = 1 
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
        LEFT JOIN ActivityType at ON a.TypeID = at.TypeID AND at.Active = 1 
        LEFT JOIN PriorityLevel pl ON a.PriorityLevelID = pl.PriorityLevelID AND pl.Active = 1  
        LEFT JOIN SequenceItem si ON a.SequenceItemID = si.SequenceItemID AND si.Active = 1
        LEFT JOIN Sequence seq ON si.SequenceID = seq.SequenceID AND seq.Active = 1
        WHERE au.UserID = @UserID 
          AND a.Active = 1 
          AND au.Active = 1
        ORDER BY 
          CASE WHEN a.DueToStart < GETDATE() AND a.Completed = 0 THEN 0 ELSE 1 END,
          a.DueToStart ASC, 
          ISNULL(pl.PriorityLevelValue, 0) DESC
      `);

    return result.recordset;
  } catch (error) {
    console.error("Error fetching activities by user:", error);
    throw error;
  }
};

//======================================
// Get account sequence with mapped activities
//======================================
async function getAccountSequenceWithActivities(accountId, userId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("AccountID", sql.Int, accountId)
      .input("UserID", sql.Int, userId)
      .query(`
        SELECT 
          acc.AccountID,
          acc.AccountName,
          acc.CreatedAt AS AccountCreatedAt,
          seq.SequenceID,
          seq.SequenceName,
          seq.SequenceDescription,
          si.SequenceItemID,
          si.SequenceItemDescription,
          si.DaysFromStart,
          si.ActivityTypeID,
          at.TypeName AS ActivityTypeName,
          at.Description AS ActivityTypeDescription,
          a.ActivityID,
          a.DueToStart,
          a.DueToEnd,
          a.Completed,
          a.PriorityLevelID,
          pl.PriorityLevelName,
          pl.PriorityLevelValue,
          a.Active AS ActivityActive,
          CASE 
            WHEN a.Completed = 1 THEN 'completed'
            WHEN a.ActivityID IS NULL THEN 'not_started'
            WHEN a.DueToStart < GETDATE() THEN 'overdue'
            WHEN a.DueToStart <= DATEADD(hour, 2, GETDATE()) THEN 'urgent'
            ELSE 'pending'
          END AS Status
        FROM Account acc
        INNER JOIN AssignedUser au ON acc.AccountID = au.AccountID
        INNER JOIN Sequence seq ON acc.SequenceID = seq.SequenceID
        INNER JOIN SequenceItem si ON seq.SequenceID = si.SequenceID AND si.Active = 1
        INNER JOIN ActivityType at ON si.ActivityTypeID = at.TypeID AND at.Active = 1
        LEFT JOIN Activity a ON si.SequenceItemID = a.SequenceItemID 
          AND a.AccountID = acc.AccountID 
          AND a.Active = 1
        LEFT JOIN PriorityLevel pl ON a.PriorityLevelID = pl.PriorityLevelID AND pl.Active = 1
        WHERE acc.AccountID = @AccountID
          AND au.UserID = @UserID
          AND au.Active = 1
          AND acc.Active = 1
          AND seq.Active = 1
        ORDER BY si.DaysFromStart ASC
      `);

    return result.recordset;
  } catch (err) {
    console.error("Database error in getAccountSequenceWithActivities:", err);
    throw err;
  }
}

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
            acc.AccountID,
            acc.AccountName
        FROM Sequence seq
        INNER JOIN SequenceItem si ON seq.SequenceID = si.SequenceID AND si.Active = 1
        INNER JOIN ActivityType at ON si.ActivityTypeID = at.TypeID AND at.Active = 1
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
      LEFT JOIN ActivityType at ON a.TypeID = at.TypeID AND at.Active = 1 
      LEFT JOIN PriorityLevel pl ON a.PriorityLevelID = pl.PriorityLevelID AND pl.Active = 1 
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
// Get user's smart work page data (Accounts → Sequences → Items)
//======================================
async function getUserSmartWorkPageData(userId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("UserID", sql.Int, userId)
      .query(`
        SELECT 
          -- Account info
          acc.AccountID,
          acc.AccountName,
          acc.CreatedAt AS AccountCreatedAt,
          
          -- Sequence info
          seq.SequenceID,
          seq.SequenceName,
          seq.SequenceDescription,
          
          -- Sequence Item info
          si.SequenceItemID,
          si.SequenceItemDescription,
          si.DaysFromStart,
          si.Active AS SequenceItemActive,
          
          -- Activity Type info
          at.TypeID,
          at.TypeName AS ActivityTypeName,
          at.Description AS ActivityTypeDescription,
          
          -- Activity info (if exists)
          a.ActivityID,
          a.DueToStart,
          a.DueToEnd,
          a.Completed,
          a.PriorityLevelID,
          a.Active AS ActivityActive,
          
          -- Priority info (if activity exists)
          pl.PriorityLevelName,
          pl.PriorityLevelValue,
          
          -- Status calculation
          CASE 
            WHEN a.ActivityID IS NULL THEN 'not_started'
            WHEN a.Completed = 1 THEN 'completed'
            WHEN a.DueToStart < GETDATE() AND a.Completed = 0 THEN 'overdue'
            WHEN a.DueToStart <= DATEADD(hour, 2, GETDATE()) AND a.Completed = 0 THEN 'urgent'
            WHEN a.Completed = 0 THEN 'pending'
            ELSE 'unknown'
          END AS Status
          
        FROM AssignedUser au
        INNER JOIN Account acc ON au.AccountID = acc.AccountID
        INNER JOIN Sequence seq ON acc.SequenceID = seq.SequenceID
        INNER JOIN SequenceItem si ON seq.SequenceID = si.SequenceID
        INNER JOIN ActivityType at ON si.ActivityTypeID = at.TypeID
        LEFT JOIN Activity a ON si.SequenceItemID = a.SequenceItemID 
          AND a.AccountID = acc.AccountID 
          AND a.Active = 1
        LEFT JOIN PriorityLevel pl ON a.PriorityLevelID = pl.PriorityLevelID AND pl.Active = 1
        
        WHERE au.UserID = @UserID
          AND au.Active = 1
          AND acc.Active = 1
          AND seq.Active = 1
          AND si.Active = 1
          AND at.Active = 1
        
        ORDER BY 
          acc.AccountName,
          seq.SequenceName,
          si.DaysFromStart
      `);

    return result.recordset;
  } catch (err) {
    console.error("Database error in getUserSmartWorkPageData:", err);
    throw err;
  }
}

//======================================
// Update sequence item status (complete/uncomplete)
//======================================
async function updateSequenceItemStatus(sequenceItemId, accountId, userId, completed) {
  try {
    const pool = await sql.connect(dbConfig);
    
    // Verify user has access to this account
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

    // Get or create activity for this sequence item
    const activityCheck = await pool.request()
      .input("SequenceItemID", sql.Int, sequenceItemId)
      .input("AccountID", sql.Int, accountId)
      .query(`
        SELECT ActivityID, Completed
        FROM Activity
        WHERE SequenceItemID = @SequenceItemID 
          AND AccountID = @AccountID
          AND Active = 1
      `);

    let activityId;

    if (activityCheck.recordset.length === 0) {
      // Create new activity
      const sequenceItemInfo = await pool.request()
        .input("SequenceItemID", sql.Int, sequenceItemId)
        .input("AccountID", sql.Int, accountId)
        .query(`
          SELECT 
            si.ActivityTypeID,
            si.DaysFromStart,
            acc.CreatedAt AS AccountCreatedAt
          FROM SequenceItem si
          INNER JOIN Sequence seq ON si.SequenceID = seq.SequenceID
          INNER JOIN Account acc ON seq.SequenceID = acc.SequenceID
          WHERE si.SequenceItemID = @SequenceItemID
            AND acc.AccountID = @AccountID
        `);

      if (sequenceItemInfo.recordset.length === 0) {
        throw new Error("Sequence item not found or not associated with account");
      }

      const info = sequenceItemInfo.recordset[0];
      const accountCreated = new Date(info.AccountCreatedAt);
      const dueDate = new Date(accountCreated);
      dueDate.setDate(dueDate.getDate() + (info.DaysFromStart || 0));

      const createResult = await pool.request()
        .input("AccountID", sql.Int, accountId)
        .input("TypeID", sql.Int, info.ActivityTypeID)
        .input("DueToStart", sql.SmallDateTime, dueDate)
        .input("SequenceItemID", sql.Int, sequenceItemId)
        .input("Completed", sql.Bit, completed ? 1 : 0)
        .query(`
          INSERT INTO Activity (
            AccountID, TypeID, DueToStart, 
            SequenceItemID, Completed, Active
          )
          OUTPUT INSERTED.ActivityID
          VALUES (
            @AccountID, @TypeID, @DueToStart,
            @SequenceItemID, @Completed, 1
          )
        `);

      activityId = createResult.recordset[0].ActivityID;
    } else {
      // Update existing activity
      activityId = activityCheck.recordset[0].ActivityID;
      
      await pool.request()
        .input("ActivityID", sql.Int, activityId)
        .input("Completed", sql.Bit, completed ? 1 : 0)
        .query(`
          UPDATE Activity
          SET Completed = @Completed
          WHERE ActivityID = @ActivityID
        `);
    }

    return { success: true, activityId };
  } catch (err) {
    console.error("Database error in updateSequenceItemStatus:", err);
    throw err;
  }
}

//======================================
// Get sequence progress for an account
//======================================
async function getSequenceProgress(accountId, sequenceId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("AccountID", sql.Int, accountId)
      .input("SequenceID", sql.Int, sequenceId)
      .query(`
        SELECT 
          COUNT(*) AS TotalItems,
          SUM(CASE 
            WHEN a.Completed = 1 THEN 1 
            ELSE 0 
          END) AS CompletedItems
        FROM SequenceItem si
        LEFT JOIN Activity a ON si.SequenceItemID = a.SequenceItemID 
          AND a.AccountID = @AccountID
          AND a.Active = 1
        WHERE si.SequenceID = @SequenceID
          AND si.Active = 1
      `);

    const data = result.recordset[0];
    const progress = data.TotalItems > 0 
      ? Math.round((data.CompletedItems / data.TotalItems) * 100)
      : 0;

    return {
      totalItems: data.TotalItems,
      completedItems: data.CompletedItems,
      progress
    };
  } catch (err) {
    console.error("Database error in getSequenceProgress:", err);
    throw err;
  }
}

// Add this new function to sequenceRepository.js

//======================================
// Get smart sequence view with visibility logic
//======================================
async function getSmartSequenceView(accountId, userId) {
  try {
    const pool = await sql.connect(dbConfig);
    
    // First verify user has access
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
          acc.PrimaryPhone as AccountPhone, 
          acc.CreatedAt AS AccountCreatedAt,
          seq.SequenceID,
          seq.SequenceName,
          seq.SequenceDescription
        FROM Account acc
        INNER JOIN Sequence seq ON acc.SequenceID = seq.SequenceID
        WHERE acc.AccountID = @AccountID
          AND acc.Active = 1
          AND seq.Active = 1
      `);

    if (accountInfo.recordset.length === 0) {
      throw new Error("Account not found or has no active sequence");
    }

    const account = accountInfo.recordset[0];

    // Get all sequence items with their activities
    const itemsResult = await pool.request()
      .input("AccountID", sql.Int, accountId)
      .input("SequenceID", sql.Int, account.SequenceID)
      .query(`
        SELECT 
          si.SequenceItemID,
          si.SequenceItemDescription,
          si.DaysFromStart,
          si.ActivityTypeID,
          at.TypeName AS ActivityTypeName,
          at.Description AS ActivityTypeDescription,
          a.ActivityID,
          a.DueToStart,
          a.DueToEnd,
          a.Completed,
          a.PriorityLevelID,
          a.Active AS ActivityActive,
          pl.PriorityLevelName,
          pl.PriorityLevelValue,
          CASE 
            WHEN a.ActivityID IS NULL THEN 'not_started'
            WHEN a.Completed = 1 THEN 'completed'
            WHEN a.DueToStart < GETDATE() AND a.Completed = 0 THEN 'overdue'
            WHEN a.DueToStart <= DATEADD(hour, 2, GETDATE()) AND a.Completed = 0 THEN 'urgent'
            WHEN a.Completed = 0 THEN 'pending'
            ELSE 'unknown'
          END AS Status
        FROM SequenceItem si
        INNER JOIN ActivityType at ON si.ActivityTypeID = at.TypeID
        LEFT JOIN Activity a ON si.SequenceItemID = a.SequenceItemID 
          AND a.AccountID = @AccountID 
          AND a.Active = 1
        LEFT JOIN PriorityLevel pl ON a.PriorityLevelID = pl.PriorityLevelID AND pl.Active = 1
        WHERE si.SequenceID = @SequenceID
          AND si.Active = 1
          AND at.Active = 1
        ORDER BY si.DaysFromStart ASC
      `);

    const allItems = itemsResult.recordset;
    
    // Calculate which items should be visible
    const accountCreated = new Date(account.AccountCreatedAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const visibleItems = [];
    let firstIncompleteFound = false;
    let totalCompleted = 0;

    for (const item of allItems) {
      const isCompleted = item.Status === 'completed';
      
      if (isCompleted) {
        totalCompleted++;
        visibleItems.push(item);
        continue;
      }

      // First incomplete item is always visible
      if (!firstIncompleteFound) {
        firstIncompleteFound = true;
        visibleItems.push(item);
        continue;
      }

      // Check if this item is due or overdue
      const itemDueDate = new Date(accountCreated);
      itemDueDate.setDate(itemDueDate.getDate() + item.DaysFromStart);
      itemDueDate.setHours(0, 0, 0, 0);

      if (itemDueDate <= today) {
        visibleItems.push(item);
      }
    }

    // Calculate progress
    const totalItems = allItems.length;
    const progress = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

    return {
      account: {
        AccountID: account.AccountID,
        AccountName: account.AccountName,
        AccountCreatedAt: account.AccountCreatedAt
      },
      sequence: {
        SequenceID: account.SequenceID,
        SequenceName: account.SequenceName,
        SequenceDescription: account.SequenceDescription
      },
      progress: {
        totalItems,
        completedItems: totalCompleted,
        progress
      },
      items: visibleItems.map(item => ({
        SequenceItemID: item.SequenceItemID,
        SequenceItemDescription: item.SequenceItemDescription,
        DaysFromStart: item.DaysFromStart,
        ActivityTypeID: item.ActivityTypeID,
        ActivityTypeName: item.ActivityTypeName,
        ActivityTypeDescription: item.ActivityTypeDescription,
        ActivityID: item.ActivityID,
        DueToStart: item.DueToStart,
        DueToEnd: item.DueToEnd,
        Completed: item.Completed,
        PriorityLevelID: item.PriorityLevelID,
        PriorityLevelName: item.PriorityLevelName,
        PriorityLevelValue: item.PriorityLevelValue,
        Status: item.Status,
        AccountID: account.AccountID,
        AccountName: account.AccountName,
        estimatedDueDate: calculateDueDate(account.AccountCreatedAt, item.DaysFromStart)
      }))
    };
  } catch (err) {
    console.error("Database error in getSmartSequenceView:", err);
    throw err;
  }
}

function calculateDueDate(accountCreatedAt, daysFromStart) {
  const startDate = new Date(accountCreatedAt);
  const dueDate = new Date(startDate);
  dueDate.setDate(dueDate.getDate() + daysFromStart);
  return dueDate;
}

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
    
    const currentActivities = allActivities
      .filter(a => !a.Completed && new Date(a.DueToStart) <= new Date());
    
    const upcomingActivities = allActivities
      .filter(a => !a.Completed && new Date(a.DueToStart) > new Date())
      .sort((a, b) => new Date(a.DueToStart) - new Date(b.DueToStart));

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
    
    // Update the current activity
    const updateRequest = new sql.Request(transaction);
    await updateRequest
      .input("ActivityID", sql.Int, activityId)
      .input("NewDueDate", sql.SmallDateTime, newDueDate)
      .query(`
        UPDATE Activity 
        SET DueToStart = @NewDueDate, UpdatedAt = GETDATE()
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
              SET DueToStart = @NewDueDate, UpdatedAt = GETDATE()
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
  assignSequenceToAccount,
  unassignSequenceFromAccount,
  getAccountsBySequence,
  getAllActivityTypes,
  
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
  getAccountSequenceWithActivities,
  getUserSmartWorkPageData,
  updateSequenceItemStatus,
  getSequenceProgress,
  getSmartSequenceView,
  getWorkPageActivities,
  getAccountActivitiesGrouped,
  updateActivityDueDateWithCascade,
};