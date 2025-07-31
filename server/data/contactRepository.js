const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

// =======================
// Get all contacts (calls GetContactDetails SP which joins related info)
// =======================
async function getAllContacts() {
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
// Create a new contact (uses CreateContact SP with audit log inside)
// =======================
async function createContact(contactData, changedBy = 0) {
  const pool = await sql.connect(dbConfig);
  const {
    AccountID,
    PersonID,
    Still_employed = 1,
    JobTitleID = null,
    WorkEmail = null,
    WorkPhone = null,
    Active = 1,
  } = contactData;

  const result = await pool.request()
    .input("AccountID", sql.Int, AccountID)
    .input("PersonID", sql.Int, PersonID)
    .input("Still_employed", sql.Bit, Still_employed)
    .input("JobTitleID", sql.Int, JobTitleID)
    .input("WorkEmail", sql.VarChar(255), WorkEmail)
    .input("WorkPhone", sql.VarChar(255), WorkPhone)
    .input("Active", sql.Bit, Active)
    .input("ChangedBy", sql.Int, changedBy)
    .input("ActionTypeID", sql.Int, 1) // Create
    .query(`
      DECLARE @NewContactID int;
      INSERT INTO Contact (AccountID, PersonID, Still_employed, JobTitleID, WorkEmail, WorkPhone, Active, CreatedAt, UpdatedAt)
      VALUES (@AccountID, @PersonID, @Still_employed, @JobTitleID, @WorkEmail, @WorkPhone, @Active, GETDATE(), GETDATE());
      SET @NewContactID = SCOPE_IDENTITY();
      EXEC InsertTempContact @NewContactID, @AccountID, @PersonID, @Still_employed, @JobTitleID, @WorkEmail, @WorkPhone, @Active, @ChangedBy, @ActionTypeID;
      SELECT @NewContactID as ContactID;
    `);

  return { ContactID: result.recordset[0].ContactID };
}

// =======================
// Update contact (with audit logging via SP)
// =======================
async function updateContact(contactId, contactData, changedBy = 0) {
  const pool = await sql.connect(dbConfig);

  // Get current record to compare changes (optional)
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
    .input("ActionTypeID", sql.Int, 2) // Update
    .execute("UpdateContact");

  return { message: "Contact updated", ContactID: contactId };
}

// =======================
// Deactivate contact (soft delete) with audit log
// =======================
async function deleteContact(contactId, changedBy = 0) {
  const pool = await sql.connect(dbConfig);

  // Get existing contact to pass all fields to SP for logging
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
    .input("ActionTypeID", sql.Int, 3) // Delete
    .execute("DeactiveContact");

  return { message: "Contact deleted (deactivated) successfully", ContactID: contactId };
}

// =======================
// Get contacts by AccountID
// =======================
async function getContactsByAccountId(accountId) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("AccountID", sql.Int, accountId)
    .query(`
      SELECT 
        c.ContactID,
        p.Title,
        p.first_name,
        p.middle_name,
        p.surname,
        c.WorkEmail,
        c.WorkPhone,
        jt.JobTitleName,       
        c.AccountID
      FROM Contact c
      JOIN Person p ON c.PersonID = p.PersonID
      LEFT JOIN JobTitle jt ON c.JobTitleID = jt.JobTitleID  
      WHERE c.AccountID = @AccountID
    `);

  return result.recordset;
}

module.exports = {
  getAllContacts,
  getContactDetails,
  createContact,
  updateContact,
  deleteContact,
  getContactsByAccountId,
};
