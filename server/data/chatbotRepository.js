// enhancedChatbotRepository.js
const { poolPromise, sql } = require("../dbConfig");

/**
 * Enhanced search with business intelligence and user context
 * Adapted for your exact database schema
 */
async function searchDatabaseEnhanced(userQuery, userId) {
  try {
    const pool = await poolPromise;
    const results = {};
    const queryLower = userQuery.toLowerCase();

    // --- Get User Profile ---
    const userProfile = await getUserProfile(userId);
    results.userProfile = userProfile;

    // --- User's Tasks/Activities (Always fetch for context) ---
    // Filter activities by user's assigned accounts
    const userActivities = await pool.request()
      .input("UserId", sql.Int, userId)
      .query(`
        SELECT TOP 10
          a.ActivityID,
          at.TypeName as ActivityType,
          acc.AccountName,
          a.DueToStart as DueDate,
          a.DueToEnd as EndDate,
          a.Completed as Status,
          pl.PriorityLevelName as Priority,
          pl.PriorityLevelValue,
          c.ContactID,
          p.first_name + ' ' + ISNULL(p.surname, '') as ContactName
        FROM [dbo].[Activity] a
        LEFT JOIN [dbo].[ActivityType] at ON a.TypeID = at.TypeID
        LEFT JOIN [dbo].[Account] acc ON a.AccountID = acc.AccountID
        LEFT JOIN [dbo].[PriorityLevel] pl ON a.PriorityLevelID = pl.PriorityLevelID
        LEFT JOIN [dbo].[ActivityContact] ac ON a.ActivityID = ac.ActivityID AND ac.Active = 1
        LEFT JOIN [dbo].[Contact] c ON ac.ContactID = c.ContactID AND c.Active = 1
        LEFT JOIN [dbo].[Person] p ON c.PersonID = p.PersonID AND p.Active = 1
        INNER JOIN [dbo].[AssignedUser] au ON a.AccountID = au.AccountID
        WHERE au.UserID = @UserId AND a.Active = 1 AND au.Active = 1
        ORDER BY 
          CASE WHEN a.Completed = 0 AND a.DueToStart < GETDATE() THEN 0 ELSE 1 END,
          a.DueToStart ASC
      `);
    if (userActivities.recordset.length) {
      results.myTasks = userActivities.recordset.map(task => ({
        ...task,
        isOverdue: !task.Status && task.DueDate && new Date(task.DueDate) < new Date(),
        isPending: !task.Status
      }));
    }

    // --- Accounts (user's assigned accounts) ---
    if (queryLower.includes("account") || queryLower.includes("company") || queryLower.includes("client")) {
      const res = await pool.request()
        .input("SearchTerm", sql.NVarChar(100), userQuery)
        .input("UserId", sql.Int, userId)
        .query(`
          SELECT TOP 10
            a.AccountID,
            a.AccountName,
            a.Website,
            a.email,
            a.PrimaryPhone,
            i.IndustryName,
            c.CityName,
            co.CountryName,
            a.number_of_employees,
            a.annual_revenue,
            a.Active
          FROM [dbo].[Account] a
          LEFT JOIN [dbo].[Industry] i ON a.IndustryID = i.IndustryID
          LEFT JOIN [dbo].[City] c ON a.CityID = c.CityID
          LEFT JOIN [dbo].[StateProvince] sp ON c.StateProvinceID = sp.StateProvinceID
          LEFT JOIN [dbo].[Country] co ON sp.CountryID = co.CountryID
          INNER JOIN [dbo].[AssignedUser] au ON a.AccountID = au.AccountID
          WHERE (a.AccountName LIKE '%' + @SearchTerm + '%' OR a.Website LIKE '%' + @SearchTerm + '%')
            AND au.UserID = @UserId
            AND a.Active = 1
            AND au.Active = 1
          ORDER BY a.AccountName
        `);
      if (res.recordset.length) results.accounts = res.recordset;
    }

    // --- Contacts (from user's assigned accounts) ---
    if (queryLower.includes("contact") || queryLower.includes("person") || queryLower.includes("people")) {
      const res = await pool.request()
        .input("SearchTerm", sql.NVarChar(100), userQuery)
        .input("UserId", sql.Int, userId)
        .query(`
          SELECT TOP 10
            c.ContactID,
            p.PersonID,
            p.first_name,
            p.middle_name,
            p.surname,
            c.WorkEmail,
            c.WorkPhone,
            jt.JobTitleName,
            a.AccountName,
            p.Active AS PersonActive,
            c.Active AS ContactActive
          FROM [dbo].[Contact] c
          INNER JOIN [dbo].[Person] p ON c.PersonID = p.PersonID
          LEFT JOIN [dbo].[JobTitle] jt ON c.JobTitleID = jt.JobTitleID
          LEFT JOIN [dbo].[Account] a ON c.AccountID = a.AccountID
          INNER JOIN [dbo].[AssignedUser] au ON c.AccountID = au.AccountID
          WHERE (p.first_name LIKE '%' + @SearchTerm + '%'
             OR p.middle_name LIKE '%' + @SearchTerm + '%'
             OR p.surname LIKE '%' + @SearchTerm + '%'
             OR c.WorkEmail LIKE '%' + @SearchTerm + '%')
            AND au.UserID = @UserId
            AND p.Active = 1
            AND c.Active = 1
            AND au.Active = 1
          ORDER BY p.surname, p.first_name
        `);
      if (res.recordset.length) {
        results.contacts = res.recordset.map(c => ({
          ...c,
          FullName: `${c.first_name || ''} ${c.middle_name || ''} ${c.surname || ''}`.trim()
        }));
      }
    }

    // --- Deals (from user's assigned accounts) ---
    if (queryLower.includes("deal") || queryLower.includes("pipeline") || 
        queryLower.includes("opportunity") || queryLower.includes("sale")) {
      const res = await pool.request()
        .input("SearchTerm", sql.NVarChar(100), userQuery)
        .input("UserId", sql.Int, userId)
        .query(`
          SELECT TOP 10
            d.DealID,
            d.DealName,
            d.Value,
            ds.StageName,
            a.AccountName,
            d.CloseDate,
            d.Probability,
            d.Active
          FROM [dbo].[Deal] d
          LEFT JOIN [dbo].[DealStage] ds ON d.DealStageID = ds.DealStageID
          LEFT JOIN [dbo].[Account] a ON d.AccountID = a.AccountID
          INNER JOIN [dbo].[AssignedUser] au ON d.AccountID = au.AccountID
          WHERE (d.DealName LIKE '%' + @SearchTerm + '%' OR ds.StageName LIKE '%' + @SearchTerm + '%')
            AND au.UserID = @UserId
            AND d.Active = 1
            AND au.Active = 1
          ORDER BY d.Value DESC
        `);
      if (res.recordset.length) results.deals = res.recordset;
      
      // Get user's deals summary
      const myDeals = await pool.request()
        .input("UserId", sql.Int, userId)
        .query(`
          SELECT 
            COUNT(d.DealID) as TotalDeals,
            SUM(d.Value) as TotalValue,
            SUM(CASE WHEN ds.StageName = 'Closed Won' THEN d.Value ELSE 0 END) as ClosedWonValue,
            SUM(CASE WHEN ds.StageName IN ('Proposal', 'Negotiation') THEN d.Value ELSE 0 END) as PipelineValue,
            COUNT(CASE WHEN ds.StageName = 'Closed Won' THEN 1 END) as WonCount,
            COUNT(CASE WHEN ds.StageName = 'Closed Lost' THEN 1 END) as LostCount,
            AVG(d.Probability) as AvgProbability
          FROM [dbo].[Deal] d
          LEFT JOIN [dbo].[DealStage] ds ON d.DealStageID = ds.DealStageID
          INNER JOIN [dbo].[AssignedUser] au ON d.AccountID = au.AccountID
          WHERE au.UserID = @UserId AND d.Active = 1 AND au.Active = 1
        `);
      if (myDeals.recordset.length) {
        const summary = myDeals.recordset[0];
        summary.WinRate = summary.WonCount + summary.LostCount > 0 
          ? ((summary.WonCount / (summary.WonCount + summary.LostCount)) * 100).toFixed(1) 
          : 0;
        results.myDealsSummary = summary;
      }
    }

    // --- Activities (general query, filtered by user's accounts) ---
    if (queryLower.includes("activity") || queryLower.includes("task") || queryLower.includes("todo")) {
      const res = await pool.request()
        .input("SearchTerm", sql.NVarChar(100), userQuery)
        .input("UserId", sql.Int, userId)
        .query(`
          SELECT TOP 10
            a.ActivityID,
            at.TypeName,
            acc.AccountName,
            a.DueToStart,
            a.Completed,
            pl.PriorityLevelName,
            a.Active
          FROM [dbo].[Activity] a
          LEFT JOIN [dbo].[ActivityType] at ON a.TypeID = at.TypeID
          LEFT JOIN [dbo].[Account] acc ON a.AccountID = acc.AccountID
          LEFT JOIN [dbo].[PriorityLevel] pl ON a.PriorityLevelID = pl.PriorityLevelID
          INNER JOIN [dbo].[AssignedUser] au ON a.AccountID = au.AccountID
          WHERE a.Active = 1
            AND au.UserID = @UserId
            AND au.Active = 1
            AND (
              at.TypeName LIKE '%' + @SearchTerm + '%'
              OR acc.AccountName LIKE '%' + @SearchTerm + '%'
              OR CAST(a.ActivityID AS NVARCHAR(50)) LIKE '%' + @SearchTerm + '%'
            )
          ORDER BY a.DueToStart DESC
        `);
      if (res.recordset.length) results.activities = res.recordset;
    }

    // --- Products ---
    if (queryLower.includes("product") || queryLower.includes("service") || queryLower.includes("pricing")) {
      const res = await pool.request()
        .input("SearchTerm", sql.NVarChar(100), userQuery)
        .execute("SearchProducts");
      if (res.recordset.length) results.products = res.recordset;
    }

    // --- Business Insights ---
    if (queryLower.includes("insight") || queryLower.includes("trend") || 
        queryLower.includes("performance") || queryLower.includes("report") ||
        queryLower.includes("analytics") || queryLower.includes("dashboard") ||
        queryLower.includes("metrics")) {
      results.insights = await getBusinessInsights(userId);
    }

    // --- Email Context (when drafting emails) ---
    if (queryLower.includes("email") || queryLower.includes("write") || 
        queryLower.includes("draft") || queryLower.includes("message") ||
        queryLower.includes("send")) {
      results.emailContext = await getEmailContext(userQuery, userId);
    }

    return results;
  } catch (err) {
    console.error("Enhanced database search error:", err);
    return { error: err.message };
  }
}

/**
 * Get user profile information from Users and Employee tables
 */
async function getUserProfile(userId) {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("UserId", sql.Int, userId)
      .query(`
        SELECT 
          u.UserID, u.Username, u.Email,
          e.EmployeeName, e.EmployeeEmail, e.EmployeePhone,
          d.DepartmentName,
          jt.JobTitleName as JobTitle
        FROM [dbo].[Users] u
        LEFT JOIN [dbo].[Employee] e ON u.UserID = e.UserID AND e.Active = 1
        LEFT JOIN [dbo].[Department] d ON e.DepartmentID = d.DepartmentID AND d.Active = 1
        LEFT JOIN [dbo].[JobTitle] jt ON e.JobTitleID = jt.JobTitleID AND jt.Active = 1
        WHERE u.UserID = @UserId AND u.Active = 1
      `);
    
    if (result.recordset.length) {
      const user = result.recordset[0];
      return {
        userId: user.UserID,
        username: user.Username,
        name: user.EmployeeName || user.Username,
        email: user.EmployeeEmail || user.Email,
        phone: user.EmployeePhone,
        role: user.JobTitle || 'Team Member',
        department: user.DepartmentName || 'Sales'
      };
    }
    return { userId, name: 'User', role: 'Team Member' };
  } catch (err) {
    console.error("Error fetching user profile:", err);
    return { userId, name: 'User', role: 'Team Member' };
  }
}

/**
 * Get business insights and analytics
 */
async function getBusinessInsights(userId) {
  try {
    const pool = await poolPromise;

    // Deal pipeline analysis by stage (for user's assigned accounts)
    const pipelineStats = await pool.request()
      .input("UserId", sql.Int, userId)
      .query(`
        SELECT 
          ds.StageName as Stage,
          COUNT(d.DealID) as DealCount,
          SUM(d.Value) as TotalValue,
          AVG(d.Value) as AvgDealSize,
          AVG(d.Probability) as AvgProbability
        FROM [dbo].[Deal] d
        LEFT JOIN [dbo].[DealStage] ds ON d.DealStageID = ds.DealStageID
        INNER JOIN [dbo].[AssignedUser] au ON d.AccountID = au.AccountID
        WHERE au.UserID = @UserId AND d.Active = 1 AND au.Active = 1
        GROUP BY ds.StageName
        ORDER BY TotalValue DESC
      `);

    // Recent activity trends (last 30 days) for user's accounts
    const activityTrends = await pool.request()
      .input("UserId", sql.Int, userId)
      .query(`
        SELECT 
          at.TypeName as ActivityType,
          COUNT(a.ActivityID) as Count,
          SUM(CASE WHEN a.Completed = 1 THEN 1 ELSE 0 END) as Completed,
          SUM(CASE WHEN a.Completed = 0 THEN 1 ELSE 0 END) as Pending,
          SUM(CASE WHEN a.Completed = 0 AND a.DueToStart < GETDATE() THEN 1 ELSE 0 END) as Overdue
        FROM [dbo].[Activity] a
        LEFT JOIN [dbo].[ActivityType] at ON a.TypeID = at.TypeID
        INNER JOIN [dbo].[AssignedUser] au ON a.AccountID = au.AccountID
        WHERE a.CreatedAt >= DATEADD(day, -30, GETDATE()) 
          AND a.Active = 1
          AND au.UserID = @UserId
          AND au.Active = 1
        GROUP BY at.TypeName
      `);

    // Top accounts by deal value (for assigned user)
    const topAccounts = await pool.request()
      .input("UserId", sql.Int, userId)
      .query(`
        SELECT TOP 5
          a.AccountName,
          i.IndustryName as Industry,
          SUM(d.Value) as TotalDealValue,
          COUNT(d.DealID) as DealCount,
          MAX(d.CloseDate) as LatestCloseDate,
          a.annual_revenue as AnnualRevenue
        FROM [dbo].[Account] a
        LEFT JOIN [dbo].[Deal] d ON a.AccountID = d.AccountID AND d.Active = 1
        LEFT JOIN [dbo].[Industry] i ON a.IndustryID = i.IndustryID
        INNER JOIN [dbo].[AssignedUser] au ON a.AccountID = au.AccountID
        WHERE au.UserID = @UserId AND a.Active = 1 AND au.Active = 1
        GROUP BY a.AccountName, i.IndustryName, a.annual_revenue
        ORDER BY TotalDealValue DESC
      `);

    // Win rate analysis (for assigned accounts)
    const winRate = await pool.request()
      .input("UserId", sql.Int, userId)
      .query(`
        SELECT 
          COUNT(CASE WHEN ds.StageName = 'Closed Won' THEN 1 END) as Won,
          COUNT(CASE WHEN ds.StageName = 'Closed Lost' THEN 1 END) as Lost,
          COUNT(CASE WHEN ds.StageName NOT IN ('Closed Won', 'Closed Lost') THEN 1 END) as Open,
          CAST(COUNT(CASE WHEN ds.StageName = 'Closed Won' THEN 1 END) * 100.0 / 
               NULLIF(COUNT(CASE WHEN ds.StageName IN ('Closed Won', 'Closed Lost') THEN 1 END), 0) 
               AS DECIMAL(5,2)) as WinRate
        FROM [dbo].[Deal] d
        LEFT JOIN [dbo].[DealStage] ds ON d.DealStageID = ds.DealStageID
        INNER JOIN [dbo].[AssignedUser] au ON d.AccountID = au.AccountID
        WHERE au.UserID = @UserId AND d.Active = 1 AND au.Active = 1
      `);

    // Monthly deal trend (last 6 months)
    const monthlyTrend = await pool.request()
      .input("UserId", sql.Int, userId)
      .query(`
        SELECT 
          FORMAT(d.CreatedAt, 'yyyy-MM') as Month,
          COUNT(d.DealID) as DealsCreated,
          SUM(d.Value) as TotalValue,
          COUNT(CASE WHEN ds.StageName = 'Closed Won' THEN 1 END) as DealsWon
        FROM [dbo].[Deal] d
        LEFT JOIN [dbo].[DealStage] ds ON d.DealStageID = ds.DealStageID
        INNER JOIN [dbo].[AssignedUser] au ON d.AccountID = au.AccountID
        WHERE au.UserID = @UserId 
          AND d.CreatedAt >= DATEADD(month, -6, GETDATE())
          AND d.Active = 1 
          AND au.Active = 1
        GROUP BY FORMAT(d.CreatedAt, 'yyyy-MM')
        ORDER BY Month DESC
      `);

    return {
      pipeline: pipelineStats.recordset,
      activityTrends: activityTrends.recordset,
      topAccounts: topAccounts.recordset,
      winRate: winRate.recordset[0] || {},
      monthlyTrend: monthlyTrend.recordset
    };
  } catch (err) {
    console.error("Error generating insights:", err);
    return null;
  }
}

/**
 * Get context for email drafting
 */
async function getEmailContext(userQuery, userId) {
  try {
    const pool = await poolPromise;
    
    // Extract potential recipient or company name from query
    const words = userQuery.split(' ').filter(w => w.length > 3);
    let recipientContext = null;

    // Try to find mentioned contact or account (from user's assigned accounts)
    for (const word of words) {
      const contact = await pool.request()
        .input("SearchTerm", sql.NVarChar(100), `%${word}%`)
        .input("UserId", sql.Int, userId)
        .query(`
          SELECT TOP 1
            c.ContactID,
            p.first_name, p.middle_name, p.surname,
            c.WorkEmail as Email,
            c.WorkPhone as Phone,
            jt.JobTitleName as JobTitle,
            a.AccountName,
            i.IndustryName as Industry,
            a.Website,
            d.DealName,
            ds.StageName as DealStage,
            d.Value as DealValue,
            d.CloseDate,
            d.Probability
          FROM [dbo].[Contact] c
          INNER JOIN [dbo].[Person] p ON c.PersonID = p.PersonID
          LEFT JOIN [dbo].[Account] a ON c.AccountID = a.AccountID
          LEFT JOIN [dbo].[Industry] i ON a.IndustryID = i.IndustryID
          LEFT JOIN [dbo].[JobTitle] jt ON c.JobTitleID = jt.JobTitleID
          LEFT JOIN [dbo].[Deal] d ON c.AccountID = d.AccountID AND d.Active = 1
          LEFT JOIN [dbo].[DealStage] ds ON d.DealStageID = ds.DealStageID
          INNER JOIN [dbo].[AssignedUser] au ON c.AccountID = au.AccountID
          WHERE (p.first_name LIKE @SearchTerm 
             OR p.surname LIKE @SearchTerm
             OR a.AccountName LIKE @SearchTerm)
            AND c.Active = 1 
            AND p.Active = 1
            AND au.UserID = @UserId
            AND au.Active = 1
          ORDER BY d.UpdatedAt DESC
        `);
      
      if (contact.recordset.length) {
        const ctx = contact.recordset[0];
        recipientContext = {
          ...ctx,
          FullName: `${ctx.first_name || ''} ${ctx.middle_name || ''} ${ctx.surname || ''}`.trim(),
          FirstName: ctx.first_name
        };
        
        // Get recent interactions with this contact
        const interactions = await pool.request()
          .input("ContactID", sql.Int, recipientContext.ContactID)
          .query(`
            SELECT TOP 3
              at.TypeName as ActivityType,
              a.DueToStart as ActivityDate,
              a.Completed
            FROM [dbo].[Activity] a
            LEFT JOIN [dbo].[ActivityType] at ON a.TypeID = at.TypeID
            LEFT JOIN [dbo].[ActivityContact] ac ON a.ActivityID = ac.ActivityID AND ac.Active = 1
            WHERE ac.ContactID = @ContactID 
              AND a.Completed = 1
              AND a.Active = 1
            ORDER BY a.DueToStart DESC
          `);
        
        recipientContext.recentInteractions = interactions.recordset;
        break;
      }
    }

    return recipientContext;
  } catch (err) {
    console.error("Error getting email context:", err);
    return null;
  }
}

/**
 * Get enriched chat history with context
 */
async function getChatHistoryEnhanced(userId, limit = 20) {
  try {
    const pool = await poolPromise;
    
    const result = await pool.request()
      .input("userId", sql.Int, userId)
      .input("limit", sql.Int, limit)
      .query(`
        SELECT TOP (@limit)
          Id, Message, Response, Timestamp, RequestType
        FROM [8589_TEAM16].[ChatHistory]
        WHERE UserId = @userId
        ORDER BY Timestamp DESC
      `);
    return result.recordset.reverse(); // Return in chronological order
  } catch (err) {
    console.error("Error fetching chat history:", err);
    return [];
  }
}

/**
 * Save chat history with request type
 */
async function saveChatHistoryEnhanced(userId, message, response, requestType = 'general') {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("userId", sql.Int, userId)
      .input("message", sql.NVarChar, message)
      .input("response", sql.NVarChar, response)
      .input("requestType", sql.NVarChar(50), requestType)
      .query(`
        INSERT INTO [8589_TEAM16].[ChatHistory] 
        (UserId, Message, Response, RequestType, Timestamp)
        VALUES (@userId, @message, @response, @requestType, GETDATE())
      `);
  } catch (err) {
    console.warn("⚠️ Could not save chat history:", err.message);
  }
}

module.exports = { 
  searchDatabaseEnhanced,
  getUserProfile,
  getBusinessInsights,
  getChatHistoryEnhanced,
  saveChatHistoryEnhanced
};