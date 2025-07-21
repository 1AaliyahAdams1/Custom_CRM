const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

// =======================
// Creates a Person
// =======================
async function createPerson(personData) {
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
      ) VALUES (
        @CityID, @StateProvinceID, @Title, @first_name, @middle_name, @surname, @linkedin_link, @personal_email, @personal_mobile
      );
      SELECT SCOPE_IDENTITY() AS PersonID;
    `);

  return result.recordset[0].PersonID;
}

// =======================
// Get a Person details by ID
// =======================
async function getPersonById(personId) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("PersonID", sql.Int, personId)
    .query(`SELECT * FROM Person WHERE PersonID = @PersonID`);
  return result.recordset[0];
}

// =======================
// Update an existing Person
// =======================
async function updatePerson(personId, personData) {
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
}

// =======================
// Exports
// =======================
module.exports = {
  createPerson,
  getPersonById,
  updatePerson,
};
