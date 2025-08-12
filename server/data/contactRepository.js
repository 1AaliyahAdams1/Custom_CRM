const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

// =======================
// Get all contacts
// =======================
async function getAllContacts(onlyActive = true) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().input("OnlyActive", sql.Bit, onlyActive ? 1 : 0).execute("GetAllContacts");
    return result.recordset;
  } catch (error) {
    console.error("Contacts Repo Error [getAllContacts]:", error);
    throw error;
  }
}

// =======================
// Get all contacts
// =======================
async function getAllContactDetails() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().execute("GetContactDetails");
  return result.recordset;
}

// =======================
// Get contact details by ID
// =======================
async function getContactDetails(contactId) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("ContactID", sql.Int, contactId)
    .execute("GetContactDetailsByID");
  return result.recordset[0];
}

// =======================
// Create a new contact
// =======================
async function createContact(data, changedBy = 1, actionTypeId = 1) {
  try {
    const {
      AccountID,
      PersonID = null,
      Still_employed = 1,
      JobTitleID = null,
      WorkEmail = null,
      WorkPhone = null,
      Active = 1,
    } = data;

    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("AccountID", sql.Int, AccountID)
      .input("PersonID", sql.Int, PersonID)
      .input("Still_employed", sql.Bit, Still_employed)
      .input("JobTitleID", sql.Int, JobTitleID)
      .input("WorkEmail", sql.VarChar(255), WorkEmail)
      .input("WorkPhone", sql.VarChar(255), WorkPhone)
      .input("Active", sql.Bit, Active)
      .input("ChangedBy", sql.Int, changedBy)
      .input("ActionTypeID", sql.Int, actionTypeId)
      .execute("CreateContact");

    return { ContactID: result.recordset[0].ContactID || null };
  } catch (error) {
    console.error("Contact Repository Error [createContact]:", error);
    throw error;
  }
}

// =======================
// Update contact
// =======================
async function updateContact(contactId, contactData, changedBy = 1) {
  const pool = await sql.connect(dbConfig);

  const existingResult = await pool.request()
    .input("ContactID", sql.Int, contactId)
    .query("SELECT * FROM Contact WHERE ContactID = @ContactID");
  if (existingResult.recordset.length === 0) throw new Error("Contact not found");
  const existing = existingResult.recordset[0];

  const {
    AccountID = existing.AccountID,
    PersonID = existing.PersonID,
    Still_employed = existing.Still_employed,
    JobTitleID = existing.JobTitleID,
    WorkEmail = existing.WorkEmail,
    WorkPhone = existing.WorkPhone,
    Active = existing.Active,
  } = contactData;

  await pool.request()
    .input("ContactID", sql.Int, contactId)
    .input("AccountID", sql.Int, AccountID)
    .input("PersonID", sql.Int, PersonID)
    .input("Still_employed", sql.Bit, Still_employed)
    .input("JobTitleID", sql.Int, JobTitleID)
    .input("WorkEmail", sql.VarChar(255), WorkEmail)
    .input("WorkPhone", sql.VarChar(255), WorkPhone)
    .input("Active", sql.Bit, Active)
    .input("ChangedBy", sql.Int, changedBy)
    .input("ActionTypeID", sql.Int, 2)
    .execute("UpdateContact");

  return { message: "Contact updated", ContactID: contactId };
}

// =======================
// Deactivate contact 
// =======================
async function deactivateContact(contactId, changedBy = 1) {
  const pool = await sql.connect(dbConfig);

  const existingResult = await pool.request()
    .input("ContactID", sql.Int, contactId)
    .query("SELECT * FROM Contact WHERE ContactID = @ContactID AND Active = 1");
  if (existingResult.recordset.length === 0) throw new Error("Contact not found or already inactive");
  const deleted = existingResult.recordset[0];

  await pool.request()
    .input("ContactID", sql.Int, contactId)
    .input("AccountID", sql.Int, deleted.AccountID)
    .input("PersonID", sql.Int, deleted.PersonID)
    .input("Still_employed", sql.Bit, deleted.Still_employed)
    .input("JobTitleID", sql.Int, deleted.JobTitleID)
    .input("WorkEmail", sql.VarChar(255), deleted.WorkEmail)
    .input("WorkPhone", sql.VarChar(255), deleted.WorkPhone)
    .input("Active", sql.Bit, 0)
    .input("ChangedBy", sql.Int, changedBy)
    .input("ActionTypeID", sql.Int, 7)
    .execute("DeactiveContact");

  return { message: "Contact deactivated successfully", ContactID: contactId };
}

// =======================
// Reactivate contact
// =======================
async function reactivateContact(contactId, changedBy = 0) {
  const pool = await sql.connect(dbConfig);

  const existingResult = await pool.request()
    .input("ContactID", sql.Int, contactId)
    .query("SELECT * FROM Contact WHERE ContactID = @ContactID AND Active = 0");
  if (existingResult.recordset.length === 0) throw new Error("Contact not found or already active");
  const contact = existingResult.recordset[0];

  await pool.request()
    .input("ContactID", sql.Int, contactId)
    .input("AccountID", sql.Int, contact.AccountID)
    .input("PersonID", sql.Int, contact.PersonID)
    .input("Still_employed", sql.Bit, contact.Still_employed)
    .input("JobTitleID", sql.Int, contact.JobTitleID)
    .input("WorkEmail", sql.VarChar(255), contact.WorkEmail)
    .input("WorkPhone", sql.VarChar(255), contact.WorkPhone)
    .input("Active", sql.Bit, 1)
    .input("ChangedBy", sql.Int, changedBy)
    .input("ActionTypeID", sql.Int, 8)
    .execute("ReactiveContact");

  return { message: "Contact reactivated successfully", ContactID: contactId };
}

// =======================
// Hard delete contact 
// =======================
async function deleteContact(contactId, changedBy = 0) {
  const pool = await sql.connect(dbConfig);

  const existingResult = await pool.request()
    .input("ContactID", sql.Int, contactId)
    .query("SELECT * FROM Contact WHERE ContactID = @ContactID AND Active = 0");
  if (existingResult.recordset.length === 0) throw new Error("Contact not found or still active");

  const contact = existingResult.recordset[0];

  await pool.request()
    .input("ContactID", sql.Int, contactId)
    .input("AccountID", sql.Int, contact.AccountID)
    .input("PersonID", sql.Int, contact.PersonID)
    .input("Still_employed", sql.Bit, contact.Still_employed)
    .input("JobTitleID", sql.Int, contact.JobTitleID)
    .input("WorkEmail", sql.VarChar(255), contact.WorkEmail)
    .input("WorkPhone", sql.VarChar(255), contact.WorkPhone)
    .input("Active", sql.Bit, 0)
    .input("ChangedBy", sql.Int, changedBy)
    .input("ActionTypeID", sql.Int, 3)
    .execute("DeleteContact");

  return { message: "Contact permanently deleted", ContactID: contactId };
}

// =======================
// Get contacts by AccountName
// =======================
async function getContactsByAccountId(accountName) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("AccountName", sql.NVarChar(255), accountName)
    .execute("GetContactDetailsByAccountName");

  return result.recordset;
}

async function getContactsByUser(userId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("UserID", sql.Int, userId)
      .query(`
        SELECT 
        c.[ContactID], c.[AccountID], a.[AccountName], 
        c.[PersonID], p.[first_name], p.[middle_name], 
        p.[surname], c.[Still_employed], c.[JobTitleID], 
        jt.[JobTitleName], c.[WorkEmail], c.[WorkPhone], 
        p.[CityID], ci.[CityName], ci.[StateProvinceID],
        sp.[StateProvince_Name], sp.[CountryID], co.[CountryName], 
        c.[Active], c.[CreatedAt], c.[UpdatedAt]
        FROM [CRM].[dbo].[Contact] c
        INNER JOIN [CRM].[dbo].[Account] a ON c.AccountID = a.AccountID
        INNER JOIN [CRM].[dbo].[Person] p ON c.PersonID = p.PersonID
        JOIN [CRM].[dbo].[AssignedUser] au ON c.AccountID = au.AccountID AND au.Active = 1
        LEFT JOIN [CRM].[dbo].[City] ci ON p.CityID = ci.CityID
        LEFT JOIN [CRM].[dbo].[StateProvince] sp ON ci.StateProvinceID = sp.StateProvinceID
        LEFT JOIN [CRM].[dbo].[Country] co ON sp.CountryID = co.CountryID
        LEFT JOIN [CRM].[dbo].[JobTitle] jt ON c.JobTitleID = jt.JobTitleID 
        WHERE au.UserID = @UserID
        AND c.Active = 1;
      `);

    return result.recordset;
  } catch (error) {
    console.error("Error fetching contacts for user accounts:", error);
    throw error;
  }
}


module.exports = {
  getAllContacts,
  getAllContactDetails,
  getContactDetails,
  createContact,
  updateContact,
  deactivateContact,
  reactivateContact,
  deleteContact,
  getContactsByAccountId,
  getContactsByUser
};
