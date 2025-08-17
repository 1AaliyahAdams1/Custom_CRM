const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

//======================================
// Get Sequences (with SequenceItems) by User
//======================================
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
    console.error("Database error in getSequencesByUser:", err);
    throw err;
  }
}


//======================================
// Get User Sequences with Accounts by UserID
//======================================
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


//======================================
// Get Activities by User
//======================================
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

// =======================
// Exports
// =======================
module.exports = {
  getSequencesandItemsByUser,
  getActivitiesByUser,
  getUserSequences
};