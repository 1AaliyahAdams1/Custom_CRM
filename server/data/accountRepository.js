const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

//======================================
// Insert into TempAccount
//======================================
async function insertTempAccountLog(pool, {
  AccountID,
  AccountName = null,
  CityID = null,
  street_address1 = null,
  street_address2 = null,
  street_address3 = null,
  postal_code = null,
  PrimaryPhone = null,
  IndustryID = null,
  Website = null,
  fax = null,
  email = null,
  number_of_employees = null,
  annual_revenue = null,
  number_of_venues = null,
  number_of_releases = null,
  number_of_events_anually = null,
  ParentAccount = null,
  Active = true,
  CreatedAt = null,
  ChangedBy = 1, // default to System user ID
  ActionTypeID = 2, // default to UPDATE
}) {
  const baseQuery = `
    INSERT INTO TempAccount (
      AccountID, AccountName, CityID,
      street_address1, street_address2, street_address3,
      postal_code, PrimaryPhone, IndustryID,
      Website, fax, email,
      number_of_employees, annual_revenue, number_of_venues,
      number_of_releases, number_of_events_anually, ParentAccount,
      Active, CreatedAt, UpdatedAt, ChangedBy, ActionTypeID
    )
    VALUES (
      @AccountID, @AccountName, @CityID,
      @street_address1, @street_address2, @street_address3,
      @postal_code, @PrimaryPhone, @IndustryID,
      @Website, @fax, @email,
      @number_of_employees, @annual_revenue, @number_of_venues,
      @number_of_releases, @number_of_events_anually, @ParentAccount,
      @Active, @CreatedAt, GETDATE(), @ChangedBy, @ActionTypeID
    )
  `;

  await pool.request()
    .input("AccountID", sql.Int, AccountID)
    .input("AccountName", sql.NVarChar, AccountName)
    .input("CityID", sql.Int, CityID)
    .input("street_address1", sql.NVarChar, street_address1)
    .input("street_address2", sql.NVarChar, street_address2)
    .input("street_address3", sql.NVarChar, street_address3)
    .input("postal_code", sql.VarChar, postal_code)
    .input("PrimaryPhone", sql.VarChar, PrimaryPhone)
    .input("IndustryID", sql.Int, IndustryID)
    .input("Website", sql.VarChar, Website)
    .input("fax", sql.VarChar, fax)
    .input("email", sql.VarChar, email)
    .input("number_of_employees", sql.Int, number_of_employees)
    .input("annual_revenue", sql.Decimal, annual_revenue)
    .input("number_of_venues", sql.SmallInt, number_of_venues)
    .input("number_of_releases", sql.SmallInt, number_of_releases)
    .input("number_of_events_anually", sql.SmallInt, number_of_events_anually)
    .input("ParentAccount", sql.Int, ParentAccount)
    .input("Active", sql.Bit, Active)
    .input("CreatedAt", sql.SmallDateTime, CreatedAt)
    .input("ChangedBy", sql.Int, ChangedBy)
    .input("ActionTypeID", sql.Int, ActionTypeID)
    .query(baseQuery);
}

//======================================
// Get all accounts QUERY 4 table
//======================================

//THIS QUERY PULLS ALL ACOUNTS EVEN DEACTIVATED ACCOUNTS
//FILTER DOWN IN BACKEND OR FRONTEND
async function getAllAccounts() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().query(` 
    SELECT 
      a.AccountID,
      a.AccountName,
      a.CityID,
      c.CityName,
      sp.StateProvince_Name,
      co.CountryName,
      a.street_address1,
      a.street_address2,
      a.street_address3,
      a.postal_code,
      a.PrimaryPhone,
      a.IndustryID,
      ind.IndustryName,
      a.Website,
      a.fax,
      a.email,
      a.number_of_employees,
      a.annual_revenue,
      a.number_of_venues,
      a.number_of_releases,
      a.number_of_events_anually,
      a.ParentAccount,
      parent.AccountName as ParentAccountName,
      a.Active,
      a.CreatedAt,
      a.UpdatedAt
    FROM Account a
    LEFT JOIN City c ON a.CityID = c.CityID
    LEFT JOIN StateProvince sp ON c.StateProvinceID = sp.StateProvinceID
    LEFT JOIN Country co ON sp.CountryID = co.CountryID
    LEFT JOIN Industry ind ON a.IndustryID = ind.IndustryID
    LEFT JOIN Account parent ON a.ParentAccount = parent.AccountID
    ORDER BY a.AccountName
  `);
  return result.recordset;
}

//======================================
// Create account QUERY
//======================================
async function createAccount(accountData, changedBy) {
  const pool = await sql.connect(dbConfig);
  const {
    AccountName,
    CityID,
    street_address1,
    street_address2,
    street_address3,
    postal_code,
    PrimaryPhone,
    IndustryID,
    Website,
    fax,
    email,
    number_of_employees,
    annual_revenue,
    number_of_venues,
    number_of_releases,
    number_of_events_anually,
    ParentAccount
  } = accountData;

  const insertResult = await pool.request()
    .input("AccountName", sql.NVarChar, AccountName)
    .input("CityID", sql.Int, CityID)
    .input("street_address1", sql.NVarChar, street_address1)
    .input("street_address2", sql.NVarChar, street_address2)
    .input("street_address3", sql.NVarChar, street_address3)
    .input("postal_code", sql.VarChar, postal_code)
    .input("PrimaryPhone", sql.VarChar, PrimaryPhone)
    .input("IndustryID", sql.Int, IndustryID)
    .input("Website", sql.VarChar, Website)
    .input("fax", sql.VarChar, fax)
    .input("email", sql.VarChar, email)
    .input("number_of_employees", sql.Int, number_of_employees)
    .input("annual_revenue", sql.Decimal, annual_revenue)
    .input("number_of_venues", sql.SmallInt, number_of_venues)
    .input("number_of_releases", sql.SmallInt, number_of_releases)
    .input("number_of_events_anually", sql.SmallInt, number_of_events_anually)
    .input("ParentAccount", sql.Int, ParentAccount)
    .query(`
      INSERT INTO Account (
        AccountName, CityID, street_address1, street_address2, street_address3,
        postal_code, PrimaryPhone, IndustryID, Website, fax, email,
        number_of_employees, annual_revenue, number_of_venues,
        number_of_releases, number_of_events_anually, ParentAccount,
        Active, CreatedAt, UpdatedAt
      )
      VALUES (
        @AccountName, @CityID, @street_address1, @street_address2, @street_address3,
        @postal_code, @PrimaryPhone, @IndustryID, @Website, @fax, @email,
        @number_of_employees, @annual_revenue, @number_of_venues,
        @number_of_releases, @number_of_events_anually, @ParentAccount,
        1, GETDATE(), GETDATE()
      );
      SELECT SCOPE_IDENTITY() AS AccountID;
    `);

  const newAccountID = insertResult.recordset[0].AccountID;

  await insertTempAccountLog(pool, {
    AccountID: newAccountID,
    AccountName,
    CityID,
    street_address1,
    street_address2,
    street_address3,
    postal_code,
    PrimaryPhone,
    IndustryID,
    Website,
    fax,
    email,
    number_of_employees,
    annual_revenue,
    number_of_venues,
    number_of_releases,
    number_of_events_anually,
    ParentAccount,
    Active: true,
    ChangedBy: changedBy,
    ActionTypeID: 1, // CREATE
  });

  return { AccountID: newAccountID };
}

//======================================
// Update account QUERY
//======================================
//======================================
// Update account QUERY
//======================================
async function updateAccount(id, accountData, changedBy) {
  const pool = await sql.connect(dbConfig);
  const existingResult = await pool.request()
    .input("AccountID", sql.Int, id)
    .query("SELECT * FROM Account WHERE AccountID = @AccountID");

  if (existingResult.recordset.length === 0) {
    throw new Error("Account not found");
  }
  
  const existing = existingResult.recordset[0];

  const {
    AccountName,
    CityID,
    street_address1,
    street_address2,
    street_address3,
    postal_code,
    PrimaryPhone,
    IndustryID,
    Website,
    fax,
    email,
    number_of_employees,
    annual_revenue,
    number_of_venues,
    number_of_releases,
    number_of_events_anually,
    ParentAccount
  } = accountData;

  await pool.request()
    .input("AccountID", sql.Int, id)
    .input("AccountName", sql.NVarChar, AccountName)
    .input("CityID", sql.Int, CityID)
    .input("street_address1", sql.NVarChar, street_address1)
    .input("street_address2", sql.NVarChar, street_address2)
    .input("street_address3", sql.NVarChar, street_address3)
    .input("postal_code", sql.VarChar, postal_code)
    .input("PrimaryPhone", sql.VarChar, PrimaryPhone)
    .input("IndustryID", sql.Int, IndustryID)
    .input("Website", sql.VarChar, Website)
    .input("fax", sql.VarChar, fax)
    .input("email", sql.VarChar, email)
    .input("number_of_employees", sql.Int, number_of_employees)
    .input("annual_revenue", sql.Decimal, annual_revenue)
    .input("number_of_venues", sql.SmallInt, number_of_venues)
    .input("number_of_releases", sql.SmallInt, number_of_releases)
    .input("number_of_events_anually", sql.SmallInt, number_of_events_anually)
    .input("ParentAccount", sql.Int, ParentAccount)
    .query(`
      UPDATE Account SET
        AccountName = @AccountName,
        CityID = @CityID,
        street_address1 = @street_address1,
        street_address2 = @street_address2,
        street_address3 = @street_address3,
        postal_code = @postal_code,
        PrimaryPhone = @PrimaryPhone,
        IndustryID = @IndustryID,
        Website = @Website,
        fax = @fax,
        email = @email,
        number_of_employees = @number_of_employees,
        annual_revenue = @annual_revenue,
        number_of_venues = @number_of_venues,
        number_of_releases = @number_of_releases,
        number_of_events_anually = @number_of_events_anually,
        ParentAccount = @ParentAccount,
        UpdatedAt = GETDATE()
      WHERE AccountID = @AccountID
    `);

  // Only log the changed fields
  const changedFields = {
    AccountID: id,
    ChangedBy: changedBy,
    ActionTypeID: 2,
    CreatedAt: existing.CreatedAt,

    AccountName: AccountName !== existing.AccountName ? AccountName : null,
    CityID: CityID !== existing.CityID ? CityID : null,
    street_address1: street_address1 !== existing.street_address1 ? street_address1 : null,
    street_address2: street_address2 !== existing.street_address2 ? street_address2 : null,
    street_address3: street_address3 !== existing.street_address3 ? street_address3 : null,
    postal_code: postal_code !== existing.postal_code ? postal_code : null,
    PrimaryPhone: PrimaryPhone !== existing.PrimaryPhone ? PrimaryPhone : null,
    IndustryID: IndustryID !== existing.IndustryID ? IndustryID : null,
    Website: Website !== existing.Website ? Website : null,
    fax: fax !== existing.fax ? fax : null,
    email: email !== existing.email ? email : null,
    number_of_employees: number_of_employees !== existing.number_of_employees ? number_of_employees : null,
    annual_revenue: annual_revenue !== existing.annual_revenue ? annual_revenue : null,
    number_of_venues: number_of_venues !== existing.number_of_venues ? number_of_venues : null,
    number_of_releases: number_of_releases !== existing.number_of_releases ? number_of_releases : null,
    number_of_events_anually: number_of_events_anually !== existing.number_of_events_anually ? number_of_events_anually : null,
    ParentAccount: ParentAccount !== existing.ParentAccount ? ParentAccount : null
  };

  // Remove unchanged fields before inserting
  const hasChanges = Object.values(changedFields).some(val => val !== null && val !== id && val !== changedBy && val !== 2 && val !== existing.CreatedAt);

  if (hasChanges) {
    await insertTempAccountLog(pool, changedFields);
  }

  return { message: "Account updated", AccountID: id };
}


//======================================
// Soft delete account QUERY
//======================================
async function deleteAccount(id, changedBy = 1) {
  const pool = await sql.connect(dbConfig);

  const existingResult = await pool.request()
    .input("AccountID", sql.Int, id)
    .query("SELECT * FROM Account WHERE AccountID = @AccountID AND Active = 1");

  if (existingResult.recordset.length === 0) {
    throw new Error("Account not found");
  }

  const deleted = existingResult.recordset[0];

  // Soft delete - set Active to false
  await pool.request()
    .input("AccountID", sql.Int, id)
    .query("UPDATE Account SET Active = 0, UpdatedAt = GETDATE() WHERE AccountID = @AccountID");

  await insertTempAccountLog(pool, {
    ...deleted,
    Active: false,
    ChangedBy: changedBy,
    ActionTypeID: 3 // DELETE
  });

  return { message: "Account deleted", AccountID: id };
}

//======================================
// Get account details by ID QUERY
//======================================
async function getAccountDetails(id) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("AccountID", sql.Int, id)
    .query(`
      SELECT
        a.AccountID,
        a.AccountName,
        a.CityID,
        c.CityName,
        sp.StateProvince_Name,
        co.CountryName,
        CONCAT_WS(' ', a.street_address1, a.street_address2, a.street_address3) AS FullAddress,
        a.street_address1,
        a.street_address2,
        a.street_address3,
        a.postal_code,
        a.PrimaryPhone,
        a.IndustryID,
        ind.IndustryName,
        a.Website,
        a.fax,
        a.email,
        a.number_of_employees,
        a.annual_revenue,
        a.number_of_venues,
        a.number_of_releases,
        a.number_of_events_anually,
        a.ParentAccount,
        parent.AccountName as ParentAccountName,
        a.Active,
        a.CreatedAt,
        a.UpdatedAt
      FROM Account a
      LEFT JOIN City c ON a.CityID = c.CityID
      LEFT JOIN StateProvince sp ON c.StateProvinceID = sp.StateProvinceID
      LEFT JOIN Country co ON sp.CountryID = co.CountryID
      LEFT JOIN Industry ind ON a.IndustryID = ind.IndustryID
      LEFT JOIN Account parent ON a.ParentAccount = parent.AccountID
      WHERE a.AccountID = @AccountID
    `);

  return result.recordset[0];
}


// =======================
// Exports
// =======================
module.exports = {
  getAllAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountDetails
};







//MAYBE LATER ADD

// //======================================
// // Get accounts with pagination and filtering
// //======================================
// async function getAccountsPaginated(page = 1, limit = 10, filters = {}) {
//   const pool = await sql.connect(dbConfig);
//   const offset = (page - 1) * limit;
  
//   let whereClause = "WHERE a.Active = 1";
//   let params = [];
  
//   if (filters.search) {
//     whereClause += " AND (a.AccountName LIKE @search OR a.email LIKE @search)";
//     params.push({ name: "search", type: sql.NVarChar, value: `%${filters.search}%` });
//   }
  
//   if (filters.industryId) {
//     whereClause += " AND a.IndustryID = @industryId";
//     params.push({ name: "industryId", type: sql.Int, value: filters.industryId });
//   }
  
//   if (filters.cityId) {
//     whereClause += " AND a.CityID = @cityId";
//     params.push({ name: "cityId", type: sql.Int, value: filters.cityId });
//   }

//   const query = `
//     SELECT 
//       a.AccountID,
//       a.AccountName,
//       a.CityID,
//       c.CityName,
//       sp.StateProvince_Name,
//       co.CountryName,
//       a.street_address1,
//       a.street_address2,
//       a.street_address3,
//       a.postal_code,
//       a.PrimaryPhone,
//       a.IndustryID,
//       ind.IndustryName,
//       a.Website,
//       a.fax,
//       a.email,
//       a.number_of_employees,
//       a.annual_revenue,
//       a.number_of_venues,
//       a.number_of_releases,
//       a.number_of_events_anually,
//       a.ParentAccount,
//       parent.AccountName as ParentAccountName,
//       a.Active,
//       a.CreatedAt,
//       a.UpdatedAt
//     FROM Account a
//     LEFT JOIN City c ON a.CityID = c.CityID
//     LEFT JOIN StateProvince sp ON c.StateProvinceID = sp.StateProvinceID
//     LEFT JOIN Country co ON sp.CountryID = co.CountryID
//     LEFT JOIN Industry ind ON a.IndustryID = ind.IndustryID
//     LEFT JOIN Account parent ON a.ParentAccount = parent.AccountID
//     ${whereClause}
//     ORDER BY a.AccountName
//     OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
//   `;

//   const countQuery = `
//     SELECT COUNT(*) as total
//     FROM Account a
//     LEFT JOIN City c ON a.CityID = c.CityID
//     LEFT JOIN Industry ind ON a.IndustryID = ind.IndustryID
//     ${whereClause}
//   `;

//   const request = pool.request()
//     .input("offset", sql.Int, offset)
//     .input("limit", sql.Int, limit);

//   params.forEach(param => {
//     request.input(param.name, param.type, param.value);
//   });

//   const [result, countResult] = await Promise.all([
//     request.query(query),
//     request.query(countQuery)
//   ]);

//   return {
//     data: result.recordset,
//     pagination: {
//       page,
//       limit,
//       total: countResult.recordset[0].total,
//       pages: Math.ceil(countResult.recordset[0].total / limit)
//     }
//   };
// }


//NEED TO WORK ON FOR ROLE MANAGEMENT

// //======================================
// // Assign user to account
// //======================================
// async function assignUserToAccount(accountId, userId) {
//   const pool = await sql.connect(dbConfig);
  
//   // Check if assignment already exists
//   const existingResult = await pool.request()
//     .input("AccountID", sql.Int, accountId)
//     .input("UserID", sql.Int, userId)
//     .query("SELECT * FROM AssignedUser WHERE AccountID = @AccountID AND UserID = @UserID");

//   if (existingResult.recordset.length > 0) {
//     throw new Error("User already assigned to this account");
//   }

//   await pool.request()
//     .input("AccountID", sql.Int, accountId)
//     .input("UserID", sql.Int, userId)
//     .query("INSERT INTO AssignedUser (AccountID, UserID) VALUES (@AccountID, @UserID)");

//   return { message: "User assigned to account", AccountID: accountId, UserID: userId };
// }

// // Remove user from account
// async function removeUserFromAccount(accountId, userId) {
//   const pool = await sql.connect(dbConfig);
  
//   await pool.request()
//     .input("AccountID", sql.Int, accountId)
//     .input("UserID", sql.Int, userId)
//     .query("DELETE FROM AssignedUser WHERE AccountID = @AccountID AND UserID = @UserID");

//   return { message: "User removed from account", AccountID: accountId, UserID: userId };
// }