const { poolPromise } = require('../../dbConfig');
const sql = require('mssql');

async function getPermissionNamesByUserID(userID) {
  const pool = await poolPromise;

  const result = await pool.request()
    .input('UserID', sql.Int, userID)
    .query(`
      SELECT DISTINCT P.PermissionName
      FROM Users U
      JOIN UserRole UR ON U.UserID = UR.UserID AND UR.Active = 1
      JOIN Roles R ON UR.RoleID = R.RoleID AND R.Active = 1
      JOIN RolePermission RP ON R.RoleID = RP.RoleID AND RP.Active = 1
      JOIN Permission P ON RP.PermissionID = P.PermissionID AND P.Active = 1
      WHERE U.UserID = @UserID
    `);

  return result.recordset.map(row => row.PermissionName);
}

module.exports = {
  getPermissionNamesByUserID,
};
