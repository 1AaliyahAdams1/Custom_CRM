const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

//======================================
// Insert into TempContact audit table
//======================================
async function insertTempContactLog(pool, {
  ContactID,
  AccountID = null,
  PersonID = null,
  Still_employed = null,
  JobTitleID = null,
  WorkEmail = null,
  WorkPhone = null,
  Active = null,
  ChangedBy = 0,
  ActionTypeID = 2, // 1=CREATE,2=UPDATE,3=DELETE
  UpdatedAt = new Date(),
}) {
  const query = `
    INSERT INTO TempContact (
      ContactID, AccountID, PersonID, Still_employed, JobTitleID, WorkEmail, WorkPhone, Active, UpdatedAt, ChangedBy, ActionTypeID
    ) VALUES (
      @ContactID, @AccountID, @PersonID, @Still_employed, @JobTitleID, @WorkEmail, @WorkPhone, @Active, @UpdatedAt, @ChangedBy, @ActionTypeID
    )
  `;

  await pool.request()
    .input("ContactID", sql.Int, ContactID)
    .input("AccountID", sql.Int, AccountID)
    .input("PersonID", sql.Int, PersonID)
    .input("Still_employed", sql.Bit, Still_employed)
    .input("JobTitleID", sql.Int, JobTitleID)
    .input("WorkEmail", sql.VarChar, WorkEmail)
    .input("WorkPhone", sql.VarChar, WorkPhone)
    .input("Active", sql.Bit, Active)
    .input("UpdatedAt", sql.DateTime, UpdatedAt)
    .input("ChangedBy", sql.Int, ChangedBy)
    .input("ActionTypeID", sql.Int, ActionTypeID)
    .query(query);
}

//======================================
//Get All Contacts for grid
//======================================
async function getAllContacts() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT 
          c.ContactID,
          c.AccountID,
          c.PersonID,
          c.Still_employed,
          c.JobTitleID,
          c.WorkEmail,
          c.WorkPhone,
          c.Active,
          c.CreatedAt,
          c.UpdatedAt,
          a.AccountName
        FROM Contact c
        INNER JOIN Account a ON c.AccountID = a.AccountID
    `);
    return result.recordset;
  } catch (error) {
    console.error("Error fetching contacts:", error);
    throw error;
  }
}

//======================================
//Pulls contact details by ID
//======================================
async function getContactDetails(contactId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("ContactID", sql.Int, contactId)
      .query(`
        SELECT
          c.ContactID,
          c.AccountID,
          c.PersonID,
          c.Still_employed,
          c.JobTitleID,
          c.WorkEmail,
          c.WorkPhone,
          p.CityID,
          ci.CityName,
          ci.StateProvinceID,
          sp.StateProvince_Name,
          sp.CountryID,
          co.CountryName,
          jt.JobTitleName,
          c.Active,
          c.CreatedAt,
          c.UpdatedAt,
          a.AccountName
        FROM Contact c
        INNER JOIN Account a ON c.AccountID = a.AccountID
        INNER JOIN Person p ON c.PersonID = p.PersonID
        LEFT JOIN City ci ON p.CityID = ci.CityID
        LEFT JOIN StateProvince sp ON p.StateProvinceID = sp.StateProvinceID
        LEFT JOIN Country co ON sp.CountryID = co.CountryID
        LEFT JOIN JobTitle jt ON c.JobTitleID = jt.JobTitleID 
        WHERE c.ContactID = @ContactID
      `);
    return result.recordset[0];  // single contact record
  } catch (error) {
    console.error("Error fetching contact details:", error);
    throw error;
  }
}

//======================================
// Create a new Contact
//======================================
async function createContact(contactData, changedBy = "System") {
  try {
    const pool = await sql.connect(dbConfig);
    const {
      AccountID,
      PersonID,
      Still_employed = 1,
      JobTitleID = null,
      WorkEmail = null,
      WorkPhone = null,
      Active = 1
    } = contactData;

    const result = await pool.request()
      .input("AccountID", sql.Int, AccountID)
      .input("PersonID", sql.Int, PersonID)
      .input("Still_employed", sql.Bit, Still_employed)
      .input("JobTitleID", sql.Int, JobTitleID)
      .input("WorkEmail", sql.VarChar, WorkEmail)
      .input("WorkPhone", sql.VarChar, WorkPhone)
      .input("Active", sql.Bit, Active)
      .query(`
          INSERT INTO Contact 
            (AccountID, PersonID, Still_employed, JobTitleID, WorkEmail, WorkPhone, Active, CreatedAt, UpdatedAt)
          VALUES
            (@AccountID, @PersonID, @Still_employed, @JobTitleID, @WorkEmail, @WorkPhone, @Active, GETDATE(), GETDATE());
          SELECT SCOPE_IDENTITY() AS ContactID;
      `);

    const newContactID = result.recordset[0].ContactID;

    await insertTempContactLog(pool, {
      ContactID: newContactID,
      AccountID,
      PersonID,
      Still_employed,
      JobTitleID,
      WorkEmail,
      WorkPhone,
      Active,
      ChangedBy: changedBy,
      ActionTypeID: 1, // CREATE
      UpdatedAt: new Date()
    });

    return { ContactID: newContactID };
  } catch (error) {
    console.error("Error creating contact:", error);
  }
}

//======================================
//Updates existing Contact
//======================================
async function updateContact(id, contactData, changedBy = "System") {
  try {
    const pool = await sql.connect(dbConfig);

    const existingResult = await pool.request()
      .input("ContactID", sql.Int, id)
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
      .input("ContactID", sql.Int, id)
      .input("AccountID", sql.Int, AccountID)
      .input("PersonID", sql.Int, PersonID)
      .input("Still_employed", sql.Bit, Still_employed)
      .input("JobTitleID", sql.Int, JobTitleID)
      .input("WorkEmail", sql.VarChar, WorkEmail)
      .input("WorkPhone", sql.VarChar, WorkPhone)
      .input("Active", sql.Bit, Active)
      .query(`
          UPDATE Contact SET
            AccountID = @AccountID,
            PersonID = @PersonID,
            Still_employed = @Still_employed,
            JobTitleID = @JobTitleID,
            WorkEmail = @WorkEmail,
            WorkPhone = @WorkPhone,
            Active = @Active,
            UpdatedAt = GETDATE()
          WHERE ContactID = @ContactID
      `);

    const fieldsChanged = {
      AccountID: AccountID !== existing.AccountID ? AccountID : null,
      PersonID: PersonID !== existing.PersonID ? PersonID : null,
      Still_employed: Still_employed !== existing.Still_employed ? Still_employed : null,
      JobTitleID: JobTitleID !== existing.JobTitleID ? JobTitleID : null,
      WorkEmail: WorkEmail !== existing.WorkEmail ? WorkEmail : null,
      WorkPhone: WorkPhone !== existing.WorkPhone ? WorkPhone : null,
      Active: Active !== existing.Active ? Active : null,
    };

    await insertTempContactLog(pool, {
      ContactID: id,
      ...fieldsChanged,
      ChangedBy: changedBy,
      ActionTypeID: 2, // UPDATE
      UpdatedAt: new Date()
    });

    return { message: "Contact updated", ContactID: id };
  } catch (error) {
    console.error("Error updating contact:", error);
    throw error;
  }
}

//======================================
// Delete existing Contact
//======================================
async function deleteContact(id, changedBy = "System") {
  try {
    const pool = await sql.connect(dbConfig);

    const existingResult = await pool.request()
      .input("ContactID", sql.Int, id)
      .query("SELECT * FROM Contact WHERE ContactID = @ContactID AND Active = 1");

    if (existingResult.recordset.length === 0) throw new Error("Contact not found");

    const deleted = existingResult.recordset[0];

    await pool.request()
      .input("ContactID", sql.Int, id)
      .query("UPDATE Contact SET Active = 0, UpdatedAt = GETDATE() WHERE ContactID = @ContactID");

    await insertTempContactLog(pool, {
      ContactID: deleted.ContactID,
      AccountID: deleted.AccountID,
      PersonID: deleted.PersonID,
      Still_employed: deleted.Still_employed,
      JobTitleID: deleted.JobTitleID,
      WorkEmail: deleted.WorkEmail,
      WorkPhone: deleted.WorkPhone,
      Active: 0,
      ChangedBy: changedBy,
      ActionTypeID: 3, // DELETE
      UpdatedAt: new Date()
    });

    return { message: "Contact deleted successfully", ContactID: id };
  } catch (error) {
    console.error("Error deleting contact:", error);
    throw error;
  }
}


//======================================
// Gets Contact information using AccountId
//======================================
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
        WHERE c.AccountID = @AccountID;
    `);

  return result.recordset;
}

//All stored procedures
//InsertTempContact
// CreateContact
// GetContactDetails
// GetContactDetailsByID
// GetContactDetailsByAccountName
// UpdateContact
// DeactiveContact
// ReactiveContact
// DeleteContact



// =======================
// Exports
// =======================
module.exports = {
  getAllContacts,
  getContactDetails,
  createContact,
  updateContact,
  deleteContact,
  getContactsByAccountId,
};
