const sql = require("mssql");
const dbConfig = require("../dbConfig");

// =======================
// Get all persons
// =======================
async function getAllPersons() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().execute("getAllPersons");
  return result.recordset;
}

// =======================
// Get person by ID
// =======================
async function getPersonById(personId) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("PersonID", sql.Int, personId)
    .execute("getPersonByID");
  return result.recordset[0];
}

// =======================
// Create a person
// =======================
async function createPerson(personData) {
  const {
    CityID,
    Title,
    first_name,
    middle_name,
    surname,
    linkedin_link,
    personal_email,
    personal_mobile,
  } = personData;

  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("CityID", sql.Int, CityID)
    .input("Title", sql.NVarChar(255), Title)
    .input("first_name", sql.NVarChar(255), first_name)
    .input("middle_name", sql.NVarChar(255), middle_name)
    .input("surname", sql.NVarChar(255), surname)
    .input("linkedin_link", sql.VarChar(255), linkedin_link)
    .input("personal_email", sql.VarChar(255), personal_email)
    .input("personal_mobile", sql.VarChar(63), personal_mobile)
    .execute("createPerson");
  return true;
}

// =======================
// Update a person
// =======================
async function updatePerson(personId, personData) {
  const {
    CityID,
    Title,
    first_name,
    middle_name,
    surname,
    linkedin_link,
    personal_email,
    personal_mobile,
  } = personData;

  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("PersonID", sql.Int, personId)
    .input("CityID", sql.Int, CityID)
    .input("Title", sql.NVarChar(255), Title)
    .input("first_name", sql.NVarChar(255), first_name)
    .input("middle_name", sql.NVarChar(255), middle_name)
    .input("surname", sql.NVarChar(255), surname)
    .input("linkedin_link", sql.VarChar(255), linkedin_link)
    .input("personal_email", sql.VarChar(255), personal_email)
    .input("personal_mobile", sql.VarChar(63), personal_mobile)
    .execute("updatePerson");
  return true;
}

// =======================
// Deactivate a person
// =======================
async function deactivatePerson(personId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("PersonID", sql.Int, personId)
    .execute("deactivatePerson");
}

// =======================
// Reactivate a person
// =======================
async function reactivatePerson(personId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("PersonID", sql.Int, personId)
    .execute("reactivatePerson");
}

// =======================
// Delete a person
// =======================
async function deletePerson(personId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("PersonID", sql.Int, personId)
    .execute("deletePerson");
}

// =======================
// Exports
// =======================
module.exports = {
  getAllPersons,
  getPersonById,
  createPerson,
  updatePerson,
  deactivatePerson,
  reactivatePerson,
  deletePerson,
};
