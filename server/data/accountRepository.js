const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

//======================================
// Get all accounts
//======================================
async function getAllAccounts() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .execute('GetAllAccounts');
    
    return result.recordset;
  } catch (err) {
    console.error("Database error in getAllAccounts:", err);
    throw err;
  }
}

//======================================
// Create account 
//======================================
async function createAccount(accountData, changedBy) {
  try {
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
      ParentAccount = null,
      Active = true,
      StateProvinceID = null,
      CountryID = null
    } = accountData;

    // Call your CreateAccount stored procedure
    const result = await pool.request()
      .input("AccountName", sql.NVarChar(255), AccountName)
      .input("CityID", sql.Int, CityID)
      .input("street_address1", sql.NVarChar(255), street_address1)
      .input("street_address2", sql.NVarChar(255), street_address2)
      .input("street_address3", sql.NVarChar(255), street_address3)
      .input("postal_code", sql.NVarChar(31), postal_code)
      .input("PrimaryPhone", sql.NVarChar(63), PrimaryPhone)
      .input("IndustryID", sql.Int, IndustryID)
      .input("Website", sql.NVarChar(255), Website)
      .input("fax", sql.NVarChar(63), fax)
      .input("email", sql.VarChar(255), email)
      .input("number_of_employees", sql.Int, number_of_employees)
      .input("annual_revenue", sql.Decimal(18, 0), annual_revenue)
      .input("number_of_venues", sql.SmallInt, number_of_venues)
      .input("number_of_releases", sql.SmallInt, number_of_releases)
      .input("number_of_events_anually", sql.SmallInt, number_of_events_anually)
      .input("ParentAccount", sql.Int, ParentAccount)
      .input("Active", sql.Bit, Active)
      .input("ChangedBy", sql.Int, changedBy)
      .input("StateProvinceID", sql.Int, StateProvinceID)
      .input("CountryID", sql.Int, CountryID)
      .input("ActionTypeID", sql.Int, 1) // 1 = Create action type id
      .execute("CreateAccount");

    // Your SP should return AccountID via SELECT or OUTPUT param
    // Assuming first recordset has the AccountID
    const newAccountID = result.recordset?.[0]?.AccountID;

    return { AccountID: newAccountID };
  } catch (err) {
    console.error("Database error in createAccount:", err);
    throw err;
  }
}

//======================================
// Update account
//======================================
async function updateAccount(id, accountData, changedBy = 1) {
  try {
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
      .input("ActionTypeID", sql.Int, 2)
      .execute('UpdateAccount');

    return { message: "Account updated", AccountID: id };
  } catch (err) {
    console.error("Database error in updateAccount:", err);
    throw err;
  }
}

//======================================
// Deactivate account
//======================================
async function deactivateAccount(account, changedBy, actionTypeId) {
  try {
    const pool = await sql.connect(dbConfig);
    
    // First update the account status in the main table
    await pool.request()
      .input('AccountID', sql.Int, account.AccountID)
      .query('UPDATE Account SET Active = 0, UpdatedAt = GETDATE() WHERE AccountID = @AccountID');
    
    // Then log the deactivation
    await pool.request()
      .input('AccountID', sql.Int, account.AccountID)
      .input('AccountName', sql.NVarChar(255), account.AccountName)
      .input('CityID', sql.Int, account.CityID)
      .input('street_address1', sql.NVarChar(255), account.street_address1)
      .input('street_address2', sql.NVarChar(255), account.street_address2)
      .input('street_address3', sql.NVarChar(255), account.street_address3)
      .input('postal_code', sql.NVarChar(31), account.postal_code)
      .input('PrimaryPhone', sql.NVarChar(63), account.PrimaryPhone)
      .input('IndustryID', sql.Int, account.IndustryID)
      .input('Website', sql.NVarChar(255), account.Website)
      .input('fax', sql.NVarChar(63), account.fax)
      .input('email', sql.VarChar(255), account.email)
      .input('number_of_employees', sql.Int, account.number_of_employees)
      .input('annual_revenue', sql.Decimal(18, 0), account.annual_revenue)
      .input('number_of_venues', sql.SmallInt, account.number_of_venues)
      .input('number_of_releases', sql.SmallInt, account.number_of_releases)
      .input('number_of_events_anually', sql.SmallInt, account.number_of_events_anually)
      .input('ParentAccount', sql.Int, account.ParentAccount)
      .input('Active', sql.Bit, false) // Set to false for deactivation
      .input('CreatedAt', sql.SmallDateTime, account.CreatedAt)
      .input('UpdatedAt', sql.SmallDateTime, new Date())
      .input('ChangedBy', sql.Int, changedBy)
      .input('ActionTypeID', sql.Int, actionTypeId)
      .execute('DeactivateAccount');
      
    return { message: "Account deactivated", AccountID: account.AccountID };
  } catch (err) {
    console.error("Database error in deactivateAccount:", err);
    throw err;
  }
}

//======================================
// Reactivate account
//======================================
async function reactivateAccount(id, changedBy) {
  try {
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

    // First update the account status in the main table
    await pool.request()
      .input('AccountID', sql.Int, id)
      .query('UPDATE Account SET Active = 1, UpdatedAt = GETDATE() WHERE AccountID = @AccountID');

    // Use the ReactivateAccount stored procedure to log the action
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
      .input("Active", sql.Bit, true) 
      .input("CreatedAt", sql.SmallDateTime, existing.CreatedAt)
      .input("UpdatedAt", sql.SmallDateTime, new Date())
      .input("ChangedBy", sql.Int, changedBy)
      .input("ActionTypeID", sql.Int, 8) 
      .execute('ReactivateAccount');

    return { message: "Account reactivated", AccountID: id };
  } catch (err) {
    console.error("Database error in reactivateAccount:", err);
    throw err;
  }
}

//======================================
// Get account details by ID using stored procedure
//======================================
async function getAccountDetails(id) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("AccountID", sql.Int, id)
      .execute('GetAccountDetails');

    return result.recordset[0] || null;
  } catch (err) {
    console.error("Database error in getAccountDetails:", err);
    throw err;
  }
}

//======================================
// Delete account 
//======================================
async function deleteAccount(id, changedBy) {
  try {
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
      throw new Error("Account must be deactivated before permanent deletion");
    }

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
      .input("ActionTypeID", sql.Int, 3) 
      .execute('DeleteAccount');

    return { message: "Account permanently deleted", AccountID: id };
  } catch (err) {
    console.error("Database error in deleteAccount:", err);
    throw err;
  }
}

// =======================
// Exports
// =======================
module.exports = {
  getAllAccounts,
  createAccount,
  updateAccount,
  deactivateAccount, 
  reactivateAccount,
  deleteAccount, 
  getAccountDetails
};