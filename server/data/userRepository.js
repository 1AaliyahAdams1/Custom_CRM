const sql = require("mssql");
const { dbConfig } = require("../dbConfig");


// =======================
// Gets all Users
// =======================
async function getAllUsers() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().query(`
    SELECT * FROM Users WHERE Active = 1
  `);
  return result.recordset;
}


// =======================
// Gets a specific user by ID
// =======================
async function getUserById(userId) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("UserID", sql.Int, userId)
    .query(`SELECT * FROM Users WHERE UserID = @UserID`);
  return result.recordset[0];
}

// Will add CRUD functionality later
// Password hashing should be handled in a service or controller

//All stored Procedures
//getAllUsers
//getUserById
//getIdByUsername
//createUser
//updateUser
//deactivateUser
//reactivateUser
//deleteUser


module.exports = {
  getAllUsers,
  getUserById
};
