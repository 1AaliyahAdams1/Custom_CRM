const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function getAllPersons() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().execute("getAllPersons");
    return result.recordset;
  } catch (error) {
    throw new Error('Error fetching all persons: ' + error.message);
  }
}

async function getPersonById(personId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("PersonID", sql.Int, personId)
      .execute("getPersonByID");
    return result.recordset[0];
  } catch (error) {
    throw new Error('Error fetching person by ID: ' + error.message);
  }
}

async function createPerson(personData) {
  try {
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
  } catch (error) {
    throw new Error('Error creating person: ' + error.message);
  }
}

async function updatePerson(personId, personData) {
  try {
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
  } catch (error) {
    throw new Error('Error updating person: ' + error.message);
  }
}

async function deactivatePerson(personId) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("PersonID", sql.Int, personId)
      .execute("deactivatePerson");
  } catch (error) {
    throw new Error('Error deactivating person: ' + error.message);
  }
}

async function reactivatePerson(personId) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("PersonID", sql.Int, personId)
      .execute("reactivatePerson");
  } catch (error) {
    throw new Error('Error reactivating person: ' + error.message);
  }
}

async function deletePerson(personId) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("PersonID", sql.Int, personId)
      .execute("deletePerson");
  } catch (error) {
    throw new Error('Error deleting person: ' + error.message);
  }
}

module.exports = {
  getAllPersons,
  getPersonById,
  createPerson,
  updatePerson,
  deactivatePerson,
  reactivatePerson,
  deletePerson,
};
