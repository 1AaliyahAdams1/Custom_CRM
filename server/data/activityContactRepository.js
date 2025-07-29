const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

// ==========================================
// Create an Activity-Contact association
// ==========================================
async function addActivityContact(activityId, contactId) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("ActivityID", sql.Int, activityId)
      .input("ContactID", sql.Int, contactId)
      .query(`
        INSERT INTO ActivityContact (ActivityID, ContactID)
        VALUES (@ActivityID, @ContactID)
      `);
  } catch (error) {
    console.error("Error adding activity contact:", error);
    throw error;
  }
}

// ==========================================
// Remove a Contact from an Activity
// ==========================================
async function removeActivityContact(activityId, contactId) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("ActivityID", sql.Int, activityId)
      .input("ContactID", sql.Int, contactId)
      .query(`
        DELETE FROM ActivityContact
        WHERE ActivityID = @ActivityID AND ContactID = @ContactID
      `);
  } catch (error) {
    console.error("Error removing activity contact:", error);
    throw error;
  }
}

// ==========================================
// Get Contacts linked to an Activity
// ==========================================
async function getContactsByActivityId(activityId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("ActivityID", sql.Int, activityId)
      .query(`
        SELECT c.ContactID, p.first_name, p.middle_name, p.surname
        FROM ActivityContact ac
        JOIN Contact c ON ac.ContactID = c.ContactID
        JOIN Person p ON c.PersonID = p.PersonID
        WHERE ac.ActivityID = @ActivityID
      `);

    return result.recordset;
  } catch (error) {
    console.error("Error fetching contacts for activity:", error);
    throw error;
  }
}

//All stored procedures
//CreateActivityContact
// GetActivityContact
// GetActivityContactByID
// UpdateActivityContact
// DeactivateContact
// ReactivateContact
// DeleteActivityContact


// =======================
// Exports
// =======================
module.exports = {
  addActivityContact,
  removeActivityContact,
  getContactsByActivityId
};