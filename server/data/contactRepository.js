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
async function getContactsByAccountId(accountName) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("AccountName", sql.NVarChar(255), accountName)
    .execute("GetContactDetailsByAccountName");

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
