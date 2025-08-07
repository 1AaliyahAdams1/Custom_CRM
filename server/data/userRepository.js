const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

// =======================
// Get all active users
// =======================
async function getAllUsers() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().execute("getAllUsers");
    return result.recordset;
  } catch (error) {
    console.error("User Repo Error [getAllUsers]:", error);
    throw error;
  }
}

// =======================
// Get user by ID
// =======================
async function getUserById(userId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("UserID", sql.Int, userId)
      .execute("getUserById");
    return result.recordset[0];
  } catch (error) {
    console.error("User Repo Error [getUserById]:", error);
    throw error;
  }
}


// =======================
// Get user by Email or Username
// =======================
async function getUserByEmailOrUsername(identifier) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("Identifier", sql.VarChar(255), identifier)
      .query(`
        SELECT 
          u.*,
          -- Aggregate all active role names for this user into a CSV string
          STUFF((
            SELECT ',' + r.RoleName
            FROM UserRole ur
            JOIN Roles r ON ur.RoleID = r.RoleID
            WHERE ur.UserID = u.UserID AND ur.Active = 1
            FOR XML PATH(''), TYPE
          ).value('.', 'NVARCHAR(MAX)'), 1, 1, '') AS RoleNames
        FROM Users u
        WHERE (u.Email = @Identifier OR u.Username = @Identifier) AND u.Active = 1
      `);

    return result.recordset[0] || null;
  } catch (error) {
    console.error("User Repo Error [getUserByEmailOrUsername]:", error);
    throw error;
  }
}



// =======================
// Get user ID by username
// =======================
async function getIdByUsername(username) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("Username", sql.VarChar(100), username)
      .execute("getIdByUsername");
    return result.recordset[0]?.UserID || null;
  } catch (error) {
    console.error("User Repo Error [getIdByUsername]:", error);
    throw error;
  }
}

// =======================
// Create new user
// =======================
async function createUser(userData) {
  try {
    const {
      Username,
      Email,
      PasswordHash,
      Salt,
      FirstName,
      LastName,
      CityID,
      isEmailVerified,
      LastLoginAt,
      PasswordResetToken,
      PasswordResetExpires,
      EmailVerificationToken,
      CreatedAt,
      UpdatedAt,
    } = userData;

    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("Username", sql.VarChar(100), Username)
      .input("Email", sql.VarChar(255), Email)
      .input("PasswordHash", sql.VarChar(255), PasswordHash)
      .input("Salt", sql.VarChar(255), Salt)
      .input("FirstName", sql.VarChar(100), FirstName)
      .input("LastName", sql.VarChar(100), LastName)
      .input("CityID", sql.Int, CityID)
      .input("isEmailVerified", sql.Bit, isEmailVerified)
      .input("LastLoginAt", sql.DateTime, LastLoginAt)
      .input("PasswordResetToken", sql.VarChar(255), PasswordResetToken)
      .input("PasswordResetExpires", sql.DateTime, PasswordResetExpires)
      .input("EmailVerificationToken", sql.VarChar(255), EmailVerificationToken)
      .input("CreatedAt", sql.DateTime, CreatedAt)
      .input("UpdatedAt", sql.DateTime, UpdatedAt)
      .execute("createUser");
  } catch (error) {
    console.error("User Repo Error [createUser]:", error);
    throw error;
  }
}

// =======================
// Update user by ID
// =======================
async function updateUser(userId, userData) {
  try {
    const {
      Username,
      Email,
      PasswordHash,
      Salt,
      FirstName,
      LastName,
      CityID,
      isEmailVerified,
      LastLoginAt,
      PasswordResetToken,
      PasswordResetExpires,
      EmailVerificationToken,
    } = userData;

    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("UserID", sql.Int, userId)
      .input("Username", sql.VarChar(100), Username)
      .input("Email", sql.VarChar(255), Email)
      .input("PasswordHash", sql.VarChar(255), PasswordHash)
      .input("Salt", sql.VarChar(255), Salt)
      .input("FirstName", sql.VarChar(100), FirstName)
      .input("LastName", sql.VarChar(100), LastName)
      .input("CityID", sql.Int, CityID)
      .input("isEmailVerified", sql.Bit, isEmailVerified)
      .input("LastLoginAt", sql.DateTime, LastLoginAt)
      .input("PasswordResetToken", sql.VarChar(255), PasswordResetToken)
      .input("PasswordResetExpires", sql.DateTime, PasswordResetExpires)
      .input("EmailVerificationToken", sql.VarChar(255), EmailVerificationToken)
      .execute("updateUser");
  } catch (error) {
    console.error("User Repo Error [updateUser]:", error);
    throw error;
  }
}

// =======================
// Deactivate user by ID (set Active = 0)
// =======================
async function deactivateUser(userId) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("UserID", sql.Int, userId)
      .execute("deactivateUser");
  } catch (error) {
    console.error("User Repo Error [deactivateUser]:", error);
    throw error;
  }
}

// =======================
// Reactivate user by ID (set Active = 1)
// =======================
async function reactivateUser(userId) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("UserID", sql.Int, userId)
      .execute("reactivateUser");
  } catch (error) {
    console.error("User Repo Error [reactivateUser]:", error);
    throw error;
  }
}

// =======================
// Delete user by ID (only if inactive)
// =======================
async function deleteUser(userId) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("UserID", sql.Int, userId)
      .execute("deleteUser");
  } catch (error) {
    console.error("User Repo Error [deleteUser]:", error);
    throw error;
  }
}

// =======================
// Exports
// =======================
module.exports = {
  getAllUsers,
  getUserById,
  getIdByUsername,
  getUserByEmailOrUsername,
  createUser,
  updateUser,
  deactivateUser,
  reactivateUser,
  deleteUser,
};
