const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

//======================================
// Get all accounts using stored procedure
//======================================
async function getAllAccounts() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .execute('GetAllAccounts');
  
  return result.recordset;
}

//======================================
// Create account using stored procedure
//======================================
async function createAccount(accountData, changedBy = 1) {
  const pool = await sql.connect(dbConfig);
  const {
    AccountName,
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
    ParentAccount = null
  } = accountData;

  // First insert the account and get the new ID
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

  // Now call the stored procedure to log the creation
  await pool.request()
    .input("AccountID", sql.Int, newAccountID)
    .input("AccountName", sql.NVarChar, AccountName)
    .input("CityID", sql.Int, CityID)
    .input("street_address1", sql.NVarChar, street_address1)
    .input("street_address2", sql.NVarChar, street_address2)
    .input("street_address3", sql.NVarChar, street_address3)
    .input("postal_code", sql.NVarChar, postal_code)
    .input("PrimaryPhone", sql.NVarChar, PrimaryPhone)
    .input("IndustryID", sql.Int, IndustryID)
    .input("Website", sql.NVarChar, Website)
    .input("fax", sql.NVarChar, fax)
    .input("email", sql.VarChar, email)
    .input("number_of_employees", sql.Int, number_of_employees)
    .input("annual_revenue", sql.Decimal, annual_revenue)
    .input("number_of_venues", sql.SmallInt, number_of_venues)
    .input("number_of_releases", sql.SmallInt, number_of_releases)
    .input("number_of_events_anually", sql.SmallInt, number_of_events_anually)
    .input("ParentAccount", sql.Int, ParentAccount)
    .input("Active", sql.Bit, true)
    .input("CreatedAt", sql.SmallDateTime, new Date())
    .input("UpdatedAt", sql.SmallDateTime, new Date())
    .input("ChangedBy", sql.Int, changedBy)
    .input("ActionTypeID", sql.Int, 1) // CREATE
    .execute('InsertTempAccount');

  return { AccountID: newAccountID };
}

//======================================
// Update account using stored procedure
//======================================
async function updateAccount(id, accountData, changedBy = 1) {
  const pool = await sql.connect(dbConfig);
  
  // First get the existing account details
  const existingResult = await pool.request()
    .input("AccountID", sql.Int, id)
    .execute('GetAccountDetails');

  if (existingResult.recordset.length === 0) {
    throw new Error("Account not found");
  }
  
  const existing = existingResult.recordset[0];

  const {
    AccountName = existing.AccountName,
    CityID = existing.CityID,
    street_address1 = existing.street_address1,
    street_address2 = existing.street_address2,
    street_address3 = existing.street_address3,
    postal_code = existing.postal_code,
    PrimaryPhone = existing.PrimaryPhone,
    IndustryID = existing.IndustryID,
    Website = existing.Website,
    fax = existing.fax,
    email = existing.email,
    number_of_employees = existing.number_of_employees,
    annual_revenue = existing.annual_revenue,
    number_of_venues = existing.number_of_venues,
    number_of_releases = existing.number_of_releases,
    number_of_events_anually = existing.number_of_events_anually,
    ParentAccount = existing.ParentAccount
  } = accountData;

  // Use the UpdateAccount stored procedure
  await pool.request()
    .input("AccountID", sql.Int, id)
    .input("AccountName", sql.NVarChar, AccountName)
    .input("CityID", sql.Int, CityID)
    .input("street_address1", sql.NVarChar, street_address1)
    .input("street_address2", sql.NVarChar, street_address2)
    .input("street_address3", sql.NVarChar, street_address3)
    .input("postal_code", sql.NVarChar, postal_code)
    .input("PrimaryPhone", sql.NVarChar, PrimaryPhone)
    .input("IndustryID", sql.Int, IndustryID)
    .input("Website", sql.NVarChar, Website)
    .input("fax", sql.NVarChar, fax)
    .input("email", sql.VarChar, email)
    .input("number_of_employees", sql.Int, number_of_employees)
    .input("annual_revenue", sql.Decimal, annual_revenue)
    .input("number_of_venues", sql.SmallInt, number_of_venues)
    .input("number_of_releases", sql.SmallInt, number_of_releases)
    .input("number_of_events_anually", sql.SmallInt, number_of_events_anually)
    .input("ParentAccount", sql.Int, ParentAccount)
    .input("Active", sql.Bit, existing.Active)
    .input("CreatedAt", sql.SmallDateTime, existing.CreatedAt)
    .input("UpdatedAt", sql.SmallDateTime, new Date())
    .input("ChangedBy", sql.Int, changedBy)
    .input("ActionTypeID", sql.Int, 2) // UPDATE
    .execute('UpdateAccount');

  return { message: "Account updated", AccountID: id };
}

//======================================
// Soft delete account using stored procedure
//======================================
async function deleteAccount(id, changedBy = 1) {
  const pool = await sql.connect(dbConfig);

  // Get existing account details first
  const existingResult = await pool.request()
    .input("AccountID", sql.Int, id)
    .execute('GetAccountDetails');

  if (existingResult.recordset.length === 0 || !existingResult.recordset[0].Active) {
    throw new Error("Account not found or already deactivated");
  }

  const existing = existingResult.recordset[0];

  // Use the DeactivateAccount stored procedure
  await pool.request()
    .input("AccountID", sql.Int, id)
    .input("AccountName", sql.NVarChar, existing.AccountName)
    .input("CityID", sql.Int, existing.CityID)
    .input("street_address1", sql.NVarChar, existing.street_address1)
    .input("street_address2", sql.NVarChar, existing.street_address2)
    .input("street_address3", sql.NVarChar, existing.street_address3)
    .input("postal_code", sql.NVarChar, existing.postal_code)
    .input("PrimaryPhone", sql.NVarChar, existing.PrimaryPhone)
    .input("IndustryID", sql.Int, existing.IndustryID)
    .input("Website", sql.NVarChar, existing.Website)
    .input("fax", sql.NVarChar, existing.fax)
    .input("email", sql.VarChar, existing.email)
    .input("number_of_employees", sql.Int, existing.number_of_employees)
    .input("annual_revenue", sql.Decimal, existing.annual_revenue)
    .input("number_of_venues", sql.SmallInt, existing.number_of_venues)
    .input("number_of_releases", sql.SmallInt, existing.number_of_releases)
    .input("number_of_events_anually", sql.SmallInt, existing.number_of_events_anually)
    .input("ParentAccount", sql.Int, existing.ParentAccount)
    .input("Active", sql.Bit, false) // This will be the new state
    .input("CreatedAt", sql.SmallDateTime, existing.CreatedAt)
    .input("UpdatedAt", sql.SmallDateTime, new Date())
    .input("ChangedBy", sql.Int, changedBy)
    .input("ActionTypeID", sql.Int, 3) // DELETE/DEACTIVATE
    .execute('DeactivateAccount');

  return { message: "Account deactivated", AccountID: id };
}

//======================================
// Reactivate account using stored procedure
//======================================
async function reactivateAccount(id, changedBy = 1) {
  const pool = await sql.connect(dbConfig);

  // Get existing account details first
  const existingResult = await pool.request()
    .input("AccountID", sql.Int, id)
    .execute('GetAccountDetails');

  if (existingResult.recordset.length === 0) {
    throw new Error("Account not found");
  }

  const existing = existingResult.recordset[0];

  if (existing.Active) {
    throw new Error("Account is already active");
  }

  // Use the ReactivateAccount stored procedure
  await pool.request()
    .input("AccountID", sql.Int, id)
    .input("AccountName", sql.NVarChar, existing.AccountName)
    .input("CityID", sql.Int, existing.CityID)
    .input("street_address1", sql.NVarChar, existing.street_address1)
    .input("street_address2", sql.NVarChar, existing.street_address2)
    .input("street_address3", sql.NVarChar, existing.street_address3)
    .input("postal_code", sql.NVarChar, existing.postal_code)
    .input("PrimaryPhone", sql.NVarChar, existing.PrimaryPhone)
    .input("IndustryID", sql.Int, existing.IndustryID)
    .input("Website", sql.NVarChar, existing.Website)
    .input("fax", sql.NVarChar, existing.fax)
    .input("email", sql.VarChar, existing.email)
    .input("number_of_employees", sql.Int, existing.number_of_employees)
    .input("annual_revenue", sql.Decimal, existing.annual_revenue)
    .input("number_of_venues", sql.SmallInt, existing.number_of_venues)
    .input("number_of_releases", sql.SmallInt, existing.number_of_releases)
    .input("number_of_events_anually", sql.SmallInt, existing.number_of_events_anually)
    .input("ParentAccount", sql.Int, existing.ParentAccount)
    .input("Active", sql.Bit, true) // This will be the new state
    .input("CreatedAt", sql.SmallDateTime, existing.CreatedAt)
    .input("UpdatedAt", sql.SmallDateTime, new Date())
    .input("ChangedBy", sql.Int, changedBy)
    .input("ActionTypeID", sql.Int, 4) // REACTIVATE (you may need to add this action type)
    .execute('ReactivateAccount');

  return { message: "Account reactivated", AccountID: id };
}

//======================================
// Get account details by ID using stored procedure
//======================================
async function getAccountDetails(id) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("AccountID", sql.Int, id)
    .execute('GetAccountDetails');

  return result.recordset[0] || null;
}

//======================================
// Hard delete account using stored procedure
//======================================
async function hardDeleteAccount(id, changedBy = 1) {
  const pool = await sql.connect(dbConfig);

  // Get existing account details first
  const existingResult = await pool.request()
    .input("AccountID", sql.Int, id)
    .execute('GetAccountDetails');

  if (existingResult.recordset.length === 0) {
    throw new Error("Account not found");
  }

  const existing = existingResult.recordset[0];

  // Check if account is deactivated (typically required before hard delete)
  if (existing.Active) {
    throw new Error("Account must be deactivated before permanent deletion");
  }

  // Use the DeleteAccount stored procedure
  await pool.request()
    .input("AccountID", sql.Int, id)
    .input("AccountName", sql.NVarChar, existing.AccountName)
    .input("CityID", sql.Int, existing.CityID)
    .input("street_address1", sql.NVarChar, existing.street_address1)
    .input("street_address2", sql.NVarChar, existing.street_address2)
    .input("street_address3", sql.NVarChar, existing.street_address3)
    .input("postal_code", sql.NVarChar, existing.postal_code)
    .input("PrimaryPhone", sql.NVarChar, existing.PrimaryPhone)
    .input("IndustryID", sql.Int, existing.IndustryID)
    .input("Website", sql.NVarChar, existing.Website)
    .input("fax", sql.NVarChar, existing.fax)
    .input("email", sql.VarChar, existing.email)
    .input("number_of_employees", sql.Int, existing.number_of_employees)
    .input("annual_revenue", sql.Decimal, existing.annual_revenue)
    .input("number_of_venues", sql.SmallInt, existing.number_of_venues)
    .input("number_of_releases", sql.SmallInt, existing.number_of_releases)
    .input("number_of_events_anually", sql.SmallInt, existing.number_of_events_anually)
    .input("ParentAccount", sql.Int, existing.ParentAccount)
    .input("Active", sql.Bit, existing.Active)
    .input("CreatedAt", sql.SmallDateTime, existing.CreatedAt)
    .input("UpdatedAt", sql.SmallDateTime, new Date())
    .input("ChangedBy", sql.Int, changedBy)
    .input("ActionTypeID", sql.Int, 5) // HARD DELETE (you may need to add this action type)
    .execute('DeleteAccount');

  return { message: "Account permanently deleted", AccountID: id };
}

//======================================
// Get active accounts only
//======================================
async function getActiveAccounts() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .execute('GetAllAccounts');
  
  // Filter active accounts on the application side
  return result.recordset.filter(account => account.Active);
}

//======================================
// Get inactive accounts only
//======================================
async function getInactiveAccounts() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .execute('GetAllAccounts');
  
  // Filter inactive accounts on the application side
  return result.recordset.filter(account => !account.Active);
}

// =======================
// Exports
// =======================
module.exports = {
  getAllAccounts,
  getActiveAccounts,
  getInactiveAccounts,
  createAccount,
  updateAccount,
  deleteAccount, // This is the soft delete (deactivate)
  reactivateAccount,
  hardDeleteAccount, // This is the permanent delete
  getAccountDetails
};