const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

// Insert into TempAccount audit log
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
  ChangedBy = 1, // default to System user ID
  ActionTypeID = 2, // default to UPDATE
}) {
  const baseQuery = `
    INSERT INTO TempAccount (
      AccountID, AccountName, CityID,
      street_address1, street_address2, street_address3,
      postal_code, PrimaryPhone, IndustryID,
      Website, fax, email,
      ChangedBy, ActionTypeID, UpdatedAt, CreatedAt
    )
    VALUES (
      @AccountID, @AccountName, @CityID,
      @street_address1, @street_address2, @street_address3,
      @postal_code, @PrimaryPhone, @IndustryID,
      @Website, @fax, @email,
      @ChangedBy, @ActionTypeID, GETDATE(), GETDATE()
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
    .input("ChangedBy", sql.Int, ChangedBy)
    .input("ActionTypeID", sql.Int, ActionTypeID)
    .query(baseQuery);
}

// Get all accounts
async function getAllAccounts() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().query("SELECT * FROM Account");
  return result.recordset;
}

// Create account
async function createAccount(accountData, changedBy = 1) {
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
    email
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
    .query(`
      INSERT INTO Account (
        AccountName, CityID, street_address1, street_address2, street_address3,
        postal_code, PrimaryPhone, IndustryID, Website, fax, email, CreatedAt
      )
      VALUES (
        @AccountName, @CityID, @street_address1, @street_address2, @street_address3,
        @postal_code, @PrimaryPhone, @IndustryID, @Website, @fax, @email, GETDATE()
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
    ChangedBy: changedBy,
    ActionTypeID: 1, // CREATE
  });

  return { AccountID: newAccountID };
}

// Update account
async function updateAccount(id, accountData, changedBy = 1) {
  const pool = await sql.connect(dbConfig);
  const existingResult = await pool.request()
    .input("AccountID", sql.Int, id)
    .query("SELECT * FROM Account WHERE AccountID = @AccountID");

  if (existingResult.recordset.length === 0) throw new Error("Account not found");
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
    email
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
        UpdatedAt = GETDATE()
      WHERE AccountID = @AccountID
    `);

  await insertTempAccountLog(pool, {
    AccountID: id,
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
    ChangedBy: changedBy,
    ActionTypeID: 2, // UPDATE
  });

  return { message: "Account updated", AccountID: id };
}

// Delete account
async function deleteAccount(id, changedBy = 1) {
  const pool = await sql.connect(dbConfig);

  const existingResult = await pool.request()
    .input("AccountID", sql.Int, id)
    .query("SELECT * FROM Account WHERE AccountID = @AccountID");

  if (existingResult.recordset.length === 0) throw new Error("Account not found");

  const deleted = existingResult.recordset[0];

  await pool.request()
    .input("AccountID", sql.Int, id)
    .query("DELETE FROM Account WHERE AccountID = @AccountID");

  await insertTempAccountLog(pool, {
    ...deleted,
    ChangedBy: changedBy,
    ActionTypeID: 3 // DELETE
  });

  return { message: "Deleted", AccountID: id };
}

// Account details
async function getAccountDetails(id) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("AccountID", sql.Int, id)
    .query(`
      SELECT
        a.AccountID,
        a.AccountName,
        c.CityName,
        sp.StateProvince_Name,
        co.CountryName,
        CONCAT_WS(' ', a.street_address1, a.street_address2, a.street_address3) AS Address,
        a.postal_code,
        a.PrimaryPhone,
        ind.IndustryName,
        a.Website,
        a.fax,
        a.email,
        a.CreatedAt,
        a.UpdatedAt
      FROM Account a
      LEFT JOIN City c ON a.CityID = c.CityID
      LEFT JOIN StateProvince sp ON c.StateProvinceID = sp.StateProvinceID
      LEFT JOIN Country co ON sp.CountryID = co.CountryID
      LEFT JOIN Industry ind ON a.IndustryID = ind.IndustryID
      WHERE a.AccountID = @AccountID
    `);

  return result.recordset[0];
}

module.exports = {
  getAllAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountDetails
};
