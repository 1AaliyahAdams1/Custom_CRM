const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

// Insert into TempContact audit table
async function insertTempContactLog(pool, {
  ContactID,
  AccountID = null,
  PersonID = null,
  Still_employed = null,
  JobTitleID = null,
  ChangedBy = "System",
  ActionType = "UPDATE",
  UpdatedAt = new Date(),
}) {
  const includeCreatedAt = ActionType === "CREATE" || ActionType === "DELETE";

  const query = `
    INSERT INTO TempContact (
      ContactID, AccountID, PersonID, Still_employed, JobTitleID,
      ChangedBy, ActionType, UpdatedAt${includeCreatedAt ? ', CreatedAt' : ''}
    ) VALUES (
      @ContactID, @AccountID, @PersonID, @Still_employed, @JobTitleID,
      @ChangedBy, @ActionType, @UpdatedAt${includeCreatedAt ? ', GETDATE()' : ''}
    )
  `;

  await pool.request()
    .input("ContactID", sql.Int, ContactID)
    .input("AccountID", sql.Int, AccountID)
    .input("PersonID", sql.Int, PersonID)
    .input("Still_employed", sql.Bit, Still_employed)
    .input("JobTitleID", sql.Int, JobTitleID)
    .input("ChangedBy", sql.VarChar, ChangedBy)
    .input("ActionType", sql.VarChar, ActionType)
    .input("UpdatedAt", sql.DateTime, UpdatedAt)
    .query(query);
}

// Get all contacts with related person & account info
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
        c.CreatedAt,
        c.UpdatedAt,
        p.first_name,
        p.middle_name,
        p.surname,
        p.CityID as PersonCityID,
        p.StateProvinceID,
        p.Title,
        p.linkedin_link,
        p.personal_email,
        p.personal_mobile,
        a.AccountName
      FROM Contact c
      INNER JOIN Person p ON c.PersonID = p.PersonID
      INNER JOIN Account a ON c.AccountID = a.AccountID
    `);
    return result.recordset;
  } catch (error) {
    console.error("Error fetching contacts:", error);
    throw error;
  }
}

// Create Contact (no Still_employed or JobTitleID by default - add if needed)
async function createContact(contactData, changedBy = "System") {
  try {
    const pool = await sql.connect(dbConfig);
    const {
      AccountID,
      PersonID,
      Still_employed = null,
      JobTitleID = null,
    } = contactData;

    const result = await pool.request()
      .input("AccountID", sql.Int, AccountID)
      .input("PersonID", sql.Int, PersonID)
      .input("Still_employed", sql.Bit, Still_employed)
      .input("JobTitleID", sql.Int, JobTitleID)
      .query(`
        INSERT INTO Contact (AccountID, PersonID, Still_employed, JobTitleID, CreatedAt, UpdatedAt)
        VALUES (@AccountID, @PersonID, @Still_employed, @JobTitleID, GETDATE(), GETDATE());
        SELECT SCOPE_IDENTITY() AS ContactID;
      `);

    const newContactID = result.recordset[0].ContactID;

    await insertTempContactLog(pool, {
      ContactID: newContactID,
      AccountID,
      PersonID,
      Still_employed,
      JobTitleID,
      ChangedBy: changedBy,
      ActionType: "CREATE"
    });

    return { ContactID: newContactID };
  } catch (error) {
    console.error("Error creating contact:", error);
    throw error;
  }
}

// Update Contact
async function updateContact(id, contactData, changedBy = "System") {
  try {
    const pool = await sql.connect(dbConfig);

    const existingResult = await pool.request()
      .input("ContactID", sql.Int, id)
      .query("SELECT * FROM Contact WHERE ContactID = @ContactID");

    if (existingResult.recordset.length === 0) {
      throw new Error("Contact not found");
    }
    const existing = existingResult.recordset[0];
    const {
      AccountID,
      PersonID,
      Still_employed,
      JobTitleID,
    } = contactData;

    await pool.request()
      .input("ContactID", sql.Int, id)
      .input("AccountID", sql.Int, AccountID)
      .input("PersonID", sql.Int, PersonID)
      .input("Still_employed", sql.Bit, Still_employed)
      .input("JobTitleID", sql.Int, JobTitleID)
      .query(`
        UPDATE Contact SET
          AccountID = @AccountID,
          PersonID = @PersonID,
          Still_employed = @Still_employed,
          JobTitleID = @JobTitleID,
          UpdatedAt = GETDATE()
        WHERE ContactID = @ContactID
      `);

    const fieldsChanged = {
      AccountID: AccountID !== existing.AccountID ? AccountID : null,
      PersonID: PersonID !== existing.PersonID ? PersonID : null,
      Still_employed: Still_employed !== existing.Still_employed ? Still_employed : null,
      JobTitleID: JobTitleID !== existing.JobTitleID ? JobTitleID : null,
    };

    await insertTempContactLog(pool, {
      ContactID: id,
      ...fieldsChanged,
      ChangedBy: changedBy,
      ActionType: "UPDATE"
    });

    return { message: "Contact updated", ContactID: id };
  } catch (error) {
    console.error("Error updating contact:", error);
    throw error;
  }
}

// Delete Contact
async function deleteContact(id, changedBy = "System") {
  try {
    const pool = await sql.connect(dbConfig);

    const existingResult = await pool.request()
      .input("ContactID", sql.Int, id)
      .query("SELECT * FROM Contact WHERE ContactID = @ContactID");

    if (existingResult.recordset.length === 0) {
      throw new Error("Contact not found");
    }
    const deleted = existingResult.recordset[0];

    await pool.request()
      .input("ContactID", sql.Int, id)
      .query("DELETE FROM Contact WHERE ContactID = @ContactID");

    await insertTempContactLog(pool, {
      ContactID: deleted.ContactID,
      AccountID: deleted.AccountID,
      PersonID: deleted.PersonID,
      Still_employed: deleted.Still_employed,
      JobTitleID: deleted.JobTitleID,
      ChangedBy: changedBy,
      ActionType: "DELETE"
    });

    return { message: "Contact deleted successfully", ContactID: id };
  } catch (error) {
    console.error("Error deleting contact:", error);
    throw error;
  }
}

// Get Contact + Person Details
async function getContactDetails(contactId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("ContactID", sql.Int, contactId)
      .query(`
        SELECT
          con.ContactID,
          p.first_name,
          p.middle_name,
          p.surname,
          p.Title,
          p.linkedin_link,
          p.personal_email,
          p.personal_mobile,
          p.CityID as PersonCityID,
          p.StateProvinceID,
          acc.AccountName AS Account,
          con.Still_employed,
          con.JobTitleID,
          ci.CityName,
          co.CountryName,
          COUNT(ac.ActivityID) AS RelatedActivityCount,
          con.CreatedAt,
          con.UpdatedAt
        FROM Contact con
        INNER JOIN Account acc ON con.AccountID = acc.AccountID
        INNER JOIN Person p ON con.PersonID = p.PersonID
        LEFT JOIN City ci ON acc.CityID = ci.CityID
        LEFT JOIN Country co ON ci.CountryID = co.CountryID
        LEFT JOIN ActivityContact ac ON con.ContactID = ac.ContactID
        WHERE con.ContactID = @ContactID
        GROUP BY
          con.ContactID, con.Still_employed, con.JobTitleID,
          con.CreatedAt, con.UpdatedAt,
          p.first_name, p.middle_name, p.surname, p.Title, p.linkedin_link, p.personal_email, p.personal_mobile,
          p.CityID, p.StateProvinceID,
          acc.AccountName, ci.CityName, co.CountryName
      `);
    return result.recordset;
  } catch (error) {
    console.error("Error fetching contact details:", error);
    throw error;
  }
}

// Person sub-functions:

async function createPerson(personData) {
  try {
    const pool = await sql.connect(dbConfig);
    const {
      PersonName,
      CityID,
      StateProvinceID,
      Title,
      first_name,
      middle_name,
      surname,
      linkedin_link,
      personal_email,
      personal_mobile,
    } = personData;

    const result = await pool.request()
      .input("CityID", sql.Int, CityID)
      .input("StateProvinceID", sql.Int, StateProvinceID)
      .input("Title", sql.VarChar, Title)
      .input("first_name", sql.VarChar, first_name)
      .input("middle_name", sql.VarChar, middle_name)
      .input("surname", sql.VarChar, surname)
      .input("linkedin_link", sql.VarChar, linkedin_link)
      .input("personal_email", sql.VarChar, personal_email)
      .input("personal_mobile", sql.VarChar, personal_mobile)
      .query(`
        INSERT INTO Person (
          CityID, StateProvinceID, Title, first_name, middle_name, surname, linkedin_link, personal_email, personal_mobile
        )
        VALUES (
          @CityID, @StateProvinceID, @Title, @first_name, @middle_name, @surname, @linkedin_link, @personal_email, @personal_mobile
        );
        SELECT SCOPE_IDENTITY() AS PersonID;
      `);

    return result.recordset[0].PersonID;
  } catch (error) {
    console.error("Error creating person:", error);
    throw error;
  }
}

async function updatePerson(personId, personData) {
  try {
    const pool = await sql.connect(dbConfig);
    const {
      CityID,
      StateProvinceID,
      Title,
      first_name,
      middle_name,
      surname,
      linkedin_link,
      personal_email,
      personal_mobile,
    } = personData;

    await pool.request()
      .input("PersonID", sql.Int, personId)
      .input("CityID", sql.Int, CityID)
      .input("StateProvinceID", sql.Int, StateProvinceID)
      .input("Title", sql.VarChar, Title)
      .input("first_name", sql.VarChar, first_name)
      .input("middle_name", sql.VarChar, middle_name)
      .input("surname", sql.VarChar, surname)
      .input("linkedin_link", sql.VarChar, linkedin_link)
      .input("personal_email", sql.VarChar, personal_email)
      .input("personal_mobile", sql.VarChar, personal_mobile)
      .query(`
        UPDATE Person SET
          CityID = @CityID,
          StateProvinceID = @StateProvinceID,
          Title = @Title,
          first_name = @first_name,
          middle_name = @middle_name,
          surname = @surname,
          linkedin_link = @linkedin_link,
          personal_email = @personal_email,
          personal_mobile = @personal_mobile
        WHERE PersonID = @PersonID
      `);

    return true;
  } catch (error) {
    console.error("Error updating person:", error);
    throw error;
  }
}

async function getAllPersons() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT
        PersonID,
        first_name,
        middle_name,
        surname,
        CityID,
        StateProvinceID,
        Title,
        linkedin_link,
        personal_email,
        personal_mobile
      FROM Person
      ORDER BY surname, first_name
    `);
    return result.recordset;
  } catch (error) {
    console.error("Error fetching persons:", error);
    throw error;
  }
}

module.exports = {
  getAllContacts,
  createContact,
  updateContact,
  deleteContact,
  getContactDetails,
  createPerson,
  updatePerson,
  getAllPersons,
};
