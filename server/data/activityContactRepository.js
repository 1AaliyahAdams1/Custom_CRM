const sql = require("mssql");
const dbConfig = require("../dbConfig");

// =======================
// Create ActivityContact
// =======================
async function createActivityContact(activityID, contactID) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("ActivityID", sql.Int, activityID)
      .input("ContactID", sql.Int, contactID)
      .execute("CreateActivityContact");
  } catch (error) {
    console.error("Error creating activity contact:", error);
    throw error;
  }
}

// =======================
// Get All ActivityContacts
// =======================
async function getAllActivityContacts() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().execute("GetActivityContact");
    return result.recordset;
  } catch (error) {
    console.error("Error retrieving all activity contacts:", error);
    throw error;
  }
}

// =======================
// Get ActivityContact by ID
// =======================
async function getActivityContactByID(activityContactID) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("ActivityContactID", sql.Int, activityContactID)
      .execute("GetActivityContactByID");
    return result.recordset[0];
  } catch (error) {
    console.error("Error retrieving activity contact by ID:", error);
    throw error;
  }
}

// =======================
// Update ActivityContact
// =======================
async function updateActivityContact(activityContactID, activityID, contactID) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("ActivityContactID", sql.Int, activityContactID)
      .input("ActivityID", sql.Int, activityID)
      .input("ContactID", sql.Int, contactID)
      .execute("UpdateActivityContact");
  } catch (error) {
    console.error("Error updating activity contact:", error);
    throw error;
  }
}

// =======================
// Deactivate ActivityContact
// =======================
async function deactivateActivityContact(activityContactID) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("ActivityContactID", sql.Int, activityContactID)
      .execute("DeactivateContact");
  } catch (error) {
    console.error("Error deactivating activity contact:", error);
    throw error;
  }
}

// =======================
// Reactivate ActivityContact
// =======================
async function reactivateActivityContact(activityContactID) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("ActivityContactID", sql.Int, activityContactID)
      .execute("ReactivateContact");
  } catch (error) {
    console.error("Error reactivating activity contact:", error);
    throw error;
  }
}

// =======================
// Delete ActivityContact
// =======================
async function deleteActivityContact(activityContactID) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("ActivityContactID", sql.Int, activityContactID)
      .execute("DeleteActivityContact");
  } catch (error) {
    console.error("Error deleting activity contact:", error);
    throw error;
  }
}

// =======================
// Get Contacts by ActivityID
// =======================
async function getContactsByActivityId(activityID) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("ActivityID", sql.Int, activityID)
      .query(`
        SELECT c.ContactID, p.first_name, p.middle_name, p.surname
        FROM ActivityContact ac
        JOIN Contact c ON ac.ContactID = c.ContactID
        JOIN Person p ON c.PersonID = p.PersonID
        WHERE ac.ActivityID = @ActivityID AND ac.Active = 1
      `);
    return result.recordset;
  } catch (error) {
    console.error("Error fetching contacts for activity:", error);
    throw error;
  }
}

// =======================
// Exports
// =======================
module.exports = {
  createActivityContact,
  getAllActivityContacts,
  getActivityContactByID,
  updateActivityContact,
  deactivateActivityContact,
  reactivateActivityContact,
  deleteActivityContact,
  getContactsByActivityId
};
