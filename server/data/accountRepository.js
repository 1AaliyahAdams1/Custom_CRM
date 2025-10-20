const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

// Helper to convert values to numbers or null
function toNullableNumber(value) {
  const num = Number(value);
  return isNaN(num) ? null : num;
}

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

    // Log incoming data and user
    console.log("[AccountRepository.createAccount] Incoming data:", accountData);
    console.log("[AccountRepository.createAccount] changedBy:", changedBy);

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
      CountryID = null,
      sequenceID = null,
    } = accountData;

<<<<<<< HEAD
    // Validate required fields
    if (!AccountName || AccountName.trim().length === 0) {
      throw new Error("Account name is required");
    }

    // Execute the stored procedure
    const result = await pool.request()
      .input("AccountName", sql.NVarChar(255), AccountName.trim())
      .input("CityID", sql.Int, CityID || null)
      .input("street_address1", sql.NVarChar(255), street_address1 || null)
      .input("street_address2", sql.NVarChar(255), street_address2 || null)
      .input("street_address3", sql.NVarChar(255), street_address3 || null)
      .input("postal_code", sql.NVarChar(31), postal_code || null)
      .input("PrimaryPhone", sql.NVarChar(63), PrimaryPhone || null)
      .input("IndustryID", sql.Int, IndustryID || null)
      .input("Website", sql.NVarChar(255), Website || null)
      .input("fax", sql.NVarChar(63), fax || null)
      .input("email", sql.VarChar(255), email || null)
      .input("number_of_employees", sql.Int, number_of_employees || null)
      .input("annual_revenue", sql.Decimal(18, 0), annual_revenue || null)
      .input("number_of_venues", sql.SmallInt, number_of_venues || null)
      .input("number_of_releases", sql.SmallInt, number_of_releases || null)
      .input("number_of_events_anually", sql.SmallInt, number_of_events_anually || null)
      .input("ParentAccount", sql.Int, ParentAccount || null)
      .input("Active", sql.Bit, Active)
      .input("StateProvinceID", sql.Int, StateProvinceID || null)
      .input("CountryID", sql.Int, CountryID || null)
      .input("ChangedBy", sql.Int, changedBy || 1)
      .input("ActionTypeID", sql.Int, 1)
      .input("sequenceID", sql.Int, sequenceID || null)
      .execute("CreateAccount");

    const newAccountID = result.recordset?.[0]?.AccountID;
    
    if (!newAccountID) {
      throw new Error("Failed to create account - no ID returned");
    }

    return { 
      success: true,
      AccountID: newAccountID,
      message: "Account created successfully"
    };
    
  } catch (err) {
    console.error("Database error in createAccount:", err);
    
    if (err.message.includes("FOREIGN KEY")) {
      throw new Error("Invalid reference: One of the selected values doesn't exist");
    } else if (err.message.includes("duplicate")) {
      throw new Error("An account with this information already exists");
    } else if (err.message.includes("NULL")) {
      throw new Error("Required field is missing");
    }
    
=======
    // Normalize optional numeric foreign keys
    const normalizedCityId = CityID ? Number(CityID) : null;
    const normalizedStateId = StateProvinceID ? Number(StateProvinceID) : null;
    const normalizedCountryId = CountryID ? Number(CountryID) : null;
    const normalizedIndustryId = IndustryID ? Number(IndustryID) : null;
    const normalizedParentAccount = ParentAccount ? Number(ParentAccount) : null;
    const normalizedSequenceId = sequenceID ? Number(sequenceID) : null;

    // Validate foreign keys actually exist
    async function validateFK(table, column, value) {
      if (!value) return null;
      const result = await pool.request()
        .input("val", sql.Int, value)
        .query(`SELECT 1 FROM ${table} WHERE ${column} = @val`);
      return result.recordset.length > 0 ? value : null;
    }

    const validCityID = await validateFK("City", "CityID", normalizedCityId);
    const validStateProvinceID = await validateFK("StateProvince", "StateProvinceID", normalizedStateId);
    const validCountryID = await validateFK("Country", "CountryID", normalizedCountryId);
    const validIndustryID = await validateFK("Industry", "IndustryID", normalizedIndustryId);
    const validParentAccount = await validateFK("Account", "AccountID", normalizedParentAccount);

    // Numeric conversions
    const annualRevenueValue = annual_revenue != null && annual_revenue !== ""
      ? Number(annual_revenue)
      : null;
    const numEmployeesValue = number_of_employees != null && number_of_employees !== ""
      ? Number(number_of_employees)
      : null;
    const numVenuesValue = number_of_venues != null && number_of_venues !== ""
      ? Number(number_of_venues)
      : null;
    const numReleasesValue = number_of_releases != null && number_of_releases !== ""
      ? Number(number_of_releases)
      : null;
    const numEventsAnnuallyValue = number_of_events_anually != null && number_of_events_anually !== ""
      ? Number(number_of_events_anually)
      : null;

    if (annualRevenueValue !== null && isNaN(annualRevenueValue)) {
      throw new Error("Invalid annual_revenue: not a number");
    }

    // Log parameters before SP call (with value and typeof for each)
    console.log("=== PARAMETERS BEING SENT TO SP ===");
    console.log("AccountName:", AccountName, "Type:", typeof AccountName);
    console.log("CityID:", validCityID, "Type:", typeof validCityID);
    console.log("StateProvinceID:", validStateProvinceID, "Type:", typeof validStateProvinceID);
    console.log("CountryID:", validCountryID, "Type:", typeof validCountryID);
    console.log("PrimaryPhone:", PrimaryPhone, "Type:", typeof PrimaryPhone);
    console.log("IndustryID:", validIndustryID, "Type:", typeof validIndustryID);
    console.log("email:", email, "Type:", typeof email);
    console.log("ParentAccount:", validParentAccount, "Type:", typeof validParentAccount);
    console.log("SequenceID:", normalizedSequenceId, "Type:", typeof normalizedSequenceId);
    console.log("ChangedBy:", changedBy, "Type:", typeof changedBy);

    let result;
    try {
      result = await pool.request()
        .input("AccountName", sql.NVarChar(255), AccountName)
        .input("CityID", sql.Int, validCityID)
        .input("street_address1", sql.NVarChar(255), street_address1)
        .input("street_address2", sql.NVarChar(255), street_address2)
        .input("street_address3", sql.NVarChar(255), street_address3)
        .input("postal_code", sql.NVarChar(31), postal_code)
        .input("PrimaryPhone", sql.NVarChar(63), PrimaryPhone)
        .input("IndustryID", sql.Int, validIndustryID)
        .input("Website", sql.NVarChar(255), Website)
        .input("fax", sql.NVarChar(63), fax)
        .input("email", sql.VarChar(255), email)
        .input("number_of_employees", sql.Int, numEmployeesValue)
        .input("annual_revenue", sql.Decimal(18, 0), annualRevenueValue)
        .input("number_of_venues", sql.SmallInt, numVenuesValue)
        .input("number_of_releases", sql.SmallInt, numReleasesValue)
        .input("number_of_events_anually", sql.SmallInt, numEventsAnnuallyValue)
        .input("ParentAccount", sql.Int, validParentAccount)
        .input("Active", sql.Bit, Active)
        .input("ChangedBy", sql.Int, changedBy)
        .input("StateProvinceID", sql.Int, validStateProvinceID)
        .input("CountryID", sql.Int, validCountryID)
        .input("ActionTypeID", sql.Int, 1)
        // Align with typical SP param naming (capital S). If your SP expects sequenceID lowercase, revert this.
        .input("SequenceID", sql.Int, normalizedSequenceId)
        .execute("CreateAccount");
    } catch (spError) {
      console.log("=== SP EXECUTION ERROR ===");
      console.log("Error:", spError?.message);
      console.log("Error Number:", spError?.number || spError?.originalError?.info?.number);
      console.log("Error State:", spError?.state || spError?.originalError?.info?.state);
      console.log("Procedure:", spError?.procName || spError?.procedure);
      console.log("Code:", spError?.code);
      throw spError;
    }

    // Deep result logging to understand the SP response shape
    try {
      console.log("[AccountRepository.createAccount] Raw SP result keys:", Object.keys(result || {}));
      console.log("[AccountRepository.createAccount] rowsAffected:", result?.rowsAffected);
      console.log("[AccountRepository.createAccount] returnValue:", result?.returnValue);
      console.log("[AccountRepository.createAccount] output:", result?.output);
      console.log("[AccountRepository.createAccount] recordsetTop:", result?.recordset?.[0]);
      console.log("[AccountRepository.createAccount] recordsets count:", Array.isArray(result?.recordsets) ? result.recordsets.length : undefined);
      if (Array.isArray(result?.recordsets)) {
        result.recordsets.forEach((rs, idx) => {
          console.log(`[AccountRepository.createAccount] recordsets[${idx}] top:`, rs?.[0]);
        });
      }
    } catch (logErr) {
      console.log("[AccountRepository.createAccount] Error while logging SP result:", logErr?.message);
    }

    // Flexible extraction of AccountID from possible shapes
    const tryCandidates = () => {
      if (result?.recordset?.[0]) {
        return (
          result.recordset[0].AccountID ||
          result.recordset[0].AccountId ||
          result.recordset[0].accountId
        );
      }
      return undefined;
    };

    let extractedAccountId = tryCandidates();

    if (!extractedAccountId && result?.output) {
      extractedAccountId = result.output.AccountID || result.output.AccountId || result.output.accountId;
      if (extractedAccountId) {
        console.log("[AccountRepository.createAccount] AccountID found in result.output");
      }
    }

    if (!extractedAccountId && Array.isArray(result?.recordsets)) {
      for (let i = 0; i < result.recordsets.length; i++) {
        const top = result.recordsets[i]?.[0];
        if (top) {
          const candidate = top.AccountID || top.AccountId || top.accountId;
          if (candidate) {
            extractedAccountId = candidate;
            console.log(`[AccountRepository.createAccount] AccountID found in recordsets[${i}][0]`);
            break;
          }
        }
      }
    }

    if (!extractedAccountId) {
      // Exhaustive scan: find any key that looks like account id in any recordset row
      if (Array.isArray(result?.recordsets)) {
        outer: for (let i = 0; i < result.recordsets.length; i++) {
          const rs = result.recordsets[i];
          for (let j = 0; j < rs.length; j++) {
            const row = rs[j];
            for (const key of Object.keys(row)) {
              if (/account.*id/i.test(key)) {
                extractedAccountId = row[key];
                console.log(`[AccountRepository.createAccount] AccountID-like key '${key}' found at recordsets[${i}][${j}]`);
                break outer;
              }
            }
          }
        }
      }
    }

    if (!extractedAccountId) {
      throw new Error("CreateAccount did not return AccountID");
    }

    return { AccountID: extractedAccountId };
  } catch (err) {
    console.error("[AccountRepository.createAccount] Error:", {
      message: err?.message,
      number: err?.number || err?.originalError?.info?.number,
      code: err?.code || err?.originalError?.code,
      stack: err?.stack,
    });
>>>>>>> ea839b4db07b3dad90afd56e3760b09b150ea2f7
    throw err;
  }
}
//======================================
// Update account
//======================================
async function updateAccount(id, accountData, changedBy = 1) {
  try {
    const pool = await sql.connect(dbConfig);

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
      ParentAccount = existing.ParentAccount,
      StateProvinceID = existing.StateProvinceID,
      CountryID = existing.CountryID,
      SequenceID = existing.SequenceID
    } = accountData;

    await pool.request()
      .input("AccountID", sql.Int, id)
      .input("AccountName", sql.NVarChar, AccountName)
      .input("CountryID", sql.Int, CountryID)
      .input("CityID", sql.Int, CityID)
      .input("StateProvinceID", sql.Int, StateProvinceID)
      .input("street_address1", sql.NVarChar, street_address1)
      .input("street_address2", sql.NVarChar, street_address2)
      .input("street_address3", sql.NVarChar, street_address3)
      .input("postal_code", sql.NVarChar, postal_code)
      .input("PrimaryPhone", sql.NVarChar, PrimaryPhone)
      .input("IndustryID", sql.Int, IndustryID)
      .input('Website', sql.NVarChar, Website)
      .input('fax', sql.NVarChar, fax)
      .input('email', sql.VarChar, email)
      .input('number_of_employees', sql.Int, number_of_employees)
      .input('annual_revenue', sql.Decimal, annual_revenue)
      .input('number_of_venues', sql.Int, number_of_venues)
      .input('number_of_releases', sql.SmallInt, number_of_releases)
      .input('number_of_events_anually', sql.SmallInt, number_of_events_anually)
      .input('ParentAccount', sql.Int, ParentAccount)
      .input('Active', sql.Bit, 1)
      .input('CreatedAt', sql.SmallDateTime, new Date())
      .input('UpdatedAt', sql.SmallDateTime, new Date())
      .input('ChangedBy', sql.Int, changedBy)
      .input('ActionTypeID', sql.Int, 1)
      .input("SequenceID", sql.Int, SequenceID)
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

    await pool.request()
      .input('AccountID', sql.Int, account.AccountID)
      .query('UPDATE Account SET Active = 0, UpdatedAt = GETDATE() WHERE AccountID = @AccountID');

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
      .input('Active', sql.Bit, false)
      .input('CreatedAt', sql.SmallDateTime, account.CreatedAt)
      .input('UpdatedAt', sql.SmallDateTime, new Date())
      .input('ChangedBy', sql.Int, changedBy)
      .input("StateProvinceID", sql.Int, account.StateProvinceID)
      .input("CountryID", sql.Int, account.CountryID)
      .input('ActionTypeID', sql.Int, actionTypeId)
      .input('sequenceID', sql.Int, account.sequenceID)
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

    await pool.request()
      .input('AccountID', sql.Int, id)
      .query('UPDATE Account SET Active = 1, UpdatedAt = GETDATE() WHERE AccountID = @AccountID');

    try {
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
        .input("StateProvinceID", sql.Int, existing.StateProvinceID) 
        .input("CountryID", sql.Int, existing.CountryID)   
        .input("ActionTypeID", sql.Int, 8)
        .execute('ReactivateAccount');
    } catch (procError) {
      console.error("Stored procedure error (non-critical):", procError);
    }

    return { message: "Account reactivated", AccountID: id };
  } catch (err) {
    console.error("Database error in reactivateAccount:", err);
    throw err;
  }
}

//======================================
// Get account details by ID
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
      .input("StateProvinceID", sql.Int, existing.StateProvinceID)
      .input("CountryID", sql.Int, existing.CountryID)
      .input("ActionTypeID", sql.Int, 3)
      .execute('DeleteAccount');

    return { message: "Account permanently deleted", AccountID: id };
  } catch (err) {
    console.error("Database error in deleteAccount:", err);
    throw err;
  }
}

//======================================
// Get active accounts by user
//======================================
async function getActiveAccountsByUser(userId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("UserID", sql.Int, userId)
      .query(`
        SELECT 
          a.[AccountID],
          a.[AccountName],
          a.[CityID],
          a.[street_address1],
          a.[street_address2],
          a.[street_address3],
          a.[postal_code],
          a.[PrimaryPhone],
          a.[IndustryID],
          a.[Website],
          a.[fax],
          a.[email],
          a.[number_of_employees],
          a.[annual_revenue],
          a.[number_of_venues],
          a.[number_of_releases],
          a.[number_of_events_anually],
          a.[ParentAccount],
          a.[Active],
          a.[CreatedAt],
          a.[UpdatedAt],
          a.[StateProvinceID],
          a.[CountryID],
          co.[CountryName],
          c.CityName
        FROM [8589_CRM].[dbo].[Account] a
        LEFT JOIN [8589_CRM].[dbo].[City] c ON a.CityID = c.CityID
        LEFT JOIN Country co ON a.CountryID = co.CountryID
        JOIN [8589_CRM].[dbo].[AssignedUser] au ON a.AccountID = au.AccountID AND au.Active = 1
        WHERE a.Active = 1
          AND au.UserID = @UserID
      `);

    return result.recordset;
  } catch (error) {
    console.error("Error fetching accounts by user:", error);
    throw error;
  }
}

//======================================
// Get active unassigned accounts
//======================================
async function getActiveUnassignedAccounts() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .query(`
        SELECT 
          a.[AccountID],
          a.[AccountName],
          a.[CityID],
          a.[street_address1],
          a.[street_address2],
          a.[street_address3],
          a.[postal_code],
          a.[PrimaryPhone],
          a.[IndustryID],
          a.[Website],
          a.[fax],
          a.[email],
          a.[number_of_employees],
          a.[annual_revenue],
          a.[number_of_venues],
          a.[number_of_releases],
          a.[number_of_events_anually],
          a.[ParentAccount],
          a.[Active],
          a.[CreatedAt],
          a.[UpdatedAt],
          a.[StateProvinceID],
          a.[CountryID],
          co.[CountryName],
          c.CityName
        FROM [8589_CRM].[dbo].[Account] a
        LEFT JOIN [8589_CRM].[dbo].[City] c ON a.CityID = c.CityID
        LEFT JOIN Country co ON a.CountryID = co.CountryID
        LEFT JOIN [8589_CRM].[dbo].[AssignedUser] au ON a.AccountID = au.AccountID AND au.Active = 1
        WHERE a.Active = 1
          AND au.UserID IS NULL
      `);

    return result.recordset;
  } catch (error) {
    console.error("Error fetching unassigned accounts:", error);
    throw error;
  }
}

//======================================
// Check if accounts are claimable (NEW)
//======================================
async function checkAccountsClaimability(accountIds, userId) {
  try {
    const pool = await sql.connect(dbConfig);
    
    // Convert array to comma-separated string for IN clause
    const idsString = accountIds.join(',');
    
    const result = await pool.request()
      .input('UserID', sql.Int, userId)
      .query(`
        SELECT 
          a.AccountID,
          a.AccountName,
          a.Active,
          CASE 
            WHEN au.UserID IS NULL THEN 'unowned'
            WHEN au.UserID = @UserID THEN 'owned'
            ELSE 'owned_by_other'
          END as ownerStatus,
          au.UserID as CurrentOwnerID
        FROM Account a
        LEFT JOIN AssignedUser au ON a.AccountID = au.AccountID AND au.Active = 1
        WHERE a.AccountID IN (${idsString})
      `);

    return result.recordset;
  } catch (error) {
    console.error("Error checking account claimability:", error);
    throw error;
  }
}

//======================================
// Bulk claim accounts
//======================================
async function bulkClaimAccounts(accountIds, userId) {
  let pool;
  
  try {
    pool = await sql.connect(dbConfig);
    
    const claimed = [];
    const failed = [];
    
    for (const accountId of accountIds) {
      try {
        // Check if account is claimable
        const checkResult = await pool.request()
          .input('AccountID', sql.Int, accountId)
          .query(`
            SELECT 
              a.AccountID,
              a.Active,
              a.AccountName,
              au.UserID as CurrentOwnerID
            FROM Account a
            LEFT JOIN AssignedUser au ON a.AccountID = au.AccountID AND au.Active = 1
            WHERE a.AccountID = @AccountID
          `);
        
        if (checkResult.recordset.length === 0) {
          failed.push({ 
            accountId, 
            accountName: 'Unknown',
            reason: 'Account not found' 
          });
          continue;
        }
        
        const account = checkResult.recordset[0];
        
        if (!account.Active) {
          failed.push({ 
            accountId, 
            accountName: account.AccountName,
            reason: 'Account is inactive' 
          });
          continue;
        }
        
        if (account.CurrentOwnerID) {
          if (account.CurrentOwnerID === userId) {
            failed.push({ 
              accountId, 
              accountName: account.AccountName,
              reason: 'You already own this account' 
            });
          } else {
            failed.push({ 
              accountId, 
              accountName: account.AccountName,
              reason: 'Account already claimed by another user' 
            });
          }
          continue;
        }
        
        // Claim the account by inserting into AssignedUser
        await pool.request()
          .input('AccountID', sql.Int, accountId)
          .input('UserID', sql.Int, userId)
          .input('Active', sql.Bit, true)
          .query(`
            INSERT INTO AssignedUser (AccountID, UserID, Active)
            VALUES (@AccountID, @UserID, @Active)
          `);
        
        claimed.push({
          accountId,
          accountName: account.AccountName
        });
        
      } catch (err) {
        console.error(`Error claiming account ${accountId}:`, err);
        failed.push({ 
          accountId, 
          accountName: 'Unknown',
          reason: err.message || 'Database error' 
        });
      }
    }
    
    return {
      success: true,
      claimed,
      failed,
      claimedCount: claimed.length,
      failedCount: failed.length,
      message: `Successfully claimed ${claimed.length} out of ${accountIds.length} accounts`
    };
    
  } catch (err) {
    console.error("Database error in bulkClaimAccounts:", err);
    throw new Error(`Failed to process bulk claim: ${err.message}`);
  }
}

//======================================
// Bulk claim accounts and assign sequence with activities
//======================================
async function bulkClaimAccountsAndAddSequence(accountIds, userId, sequenceId) {
  const pool = await sql.connect(dbConfig);
  const transaction = new sql.Transaction(pool);
  
  try {
    await transaction.begin();
    
    const claimed = [];
    const failed = [];
    
    // Get sequence items first
    const sequenceItemsResult = await new sql.Request(transaction)
      .input('SequenceID', sql.Int, sequenceId)
      .query(`
        SELECT 
          si.SequenceItemID,
          si.ActivityTypeID,
          si.DaysFromStart,
          si.SequenceItemDescription
        FROM SequenceItem si
        WHERE si.SequenceID = @SequenceID
          AND si.Active = 1
        ORDER BY si.DaysFromStart
      `);
    
    const sequenceItems = sequenceItemsResult.recordset;
    
    if (sequenceItems.length === 0) {
      throw new Error('Sequence has no active items');
    }
    
    const assignmentDate = new Date();
    
    for (const accountId of accountIds) {
      try {
        const checkResult = await new sql.Request(transaction)
          .input('AccountID', sql.Int, accountId)
          .query(`
            SELECT 
              a.AccountID,
              a.Active,
              a.AccountName,
              a.CreatedAt,
              au.UserID as CurrentOwnerID
            FROM Account a
            LEFT JOIN AssignedUser au ON a.AccountID = au.AccountID AND au.Active = 1
            WHERE a.AccountID = @AccountID
          `);
        
        if (checkResult.recordset.length === 0) {
          failed.push({ 
            accountId, 
            accountName: 'Unknown',
            reason: 'Account not found' 
          });
          continue;
        }
        
        const account = checkResult.recordset[0];
        
        if (!account.Active) {
          failed.push({ 
            accountId, 
            accountName: account.AccountName,
            reason: 'Account is inactive' 
          });
          continue;
        }
        
        if (account.CurrentOwnerID && account.CurrentOwnerID !== userId) {
          failed.push({ 
            accountId, 
            accountName: account.AccountName,
            reason: 'Account already claimed by another user' 
          });
          continue;
        }
        
        if (!account.CurrentOwnerID) {
          await new sql.Request(transaction)
            .input('AccountID', sql.Int, accountId)
            .input('UserID', sql.Int, userId)
            .input('Active', sql.Bit, true)
            .query(`
              INSERT INTO AssignedUser (AccountID, UserID, Active)
              VALUES (@AccountID, @UserID, @Active)
            `);
        }       
        await new sql.Request(transaction)
          .input('AccountID', sql.Int, accountId)
          .input('SequenceID', sql.Int, sequenceId)
          .query(`
            UPDATE Account 
            SET SequenceID = @SequenceID
            WHERE AccountID = @AccountID
          `);
        let activitiesCreated = 0;
        
        for (const item of sequenceItems) {
          const dueDate = new Date(assignmentDate);
          dueDate.setDate(dueDate.getDate() + item.DaysFromStart - 1);
          dueDate.setHours(23, 59, 0, 0);

          await new sql.Request(transaction)
            .input('AccountID', sql.Int, accountId)
            .input('TypeID', sql.Int, item.ActivityTypeID)
            .input('DueToStart', sql.SmallDateTime, dueDate)
            .input('SequenceItemID', sql.Int, item.SequenceItemID)
            .input('Completed', sql.Bit, false)
            .input('Active', sql.Bit, true)
            .query(`
              INSERT INTO Activity (
                AccountID, TypeID, DueToStart, 
                SequenceItemID, Completed, Active
              )
              VALUES (
                @AccountID, @TypeID, @DueToStart,
                @SequenceItemID, @Completed, @Active
              )
            `);
          
          activitiesCreated++;
        }
        
        claimed.push({
          accountId,
          accountName: account.AccountName,
          activitiesCreated
        });
        
      } catch (err) {
        failed.push({ 
          accountId, 
          accountName: 'Unknown',
          reason: err.message || 'Database error' 
        });
      }
    }
    
    await transaction.commit();
    
    return {
      success: true,
      claimed,
      failed,
      claimedCount: claimed.length,
      failedCount: failed.length,
      totalActivitiesCreated: claimed.reduce((sum, item) => sum + item.activitiesCreated, 0),
      message: `Successfully claimed ${claimed.length} account(s) and created activities`
    };
    
  } catch (err) {
    await transaction.rollback();
    console.error("Database error in bulkClaimAccountsAndAddSequence:", err);
    throw new Error(`Failed to process bulk claim and sequence: ${err.message}`);
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
  getAccountDetails,
  getActiveAccountsByUser,
  getActiveUnassignedAccounts,
  checkAccountsClaimability,
  bulkClaimAccounts,
  bulkClaimAccountsAndAddSequence,
};