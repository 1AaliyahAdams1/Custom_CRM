// const sql = require("mssql");
// const { dbConfig } = require("../dbConfig");

// //======================================
// // Get all AccountInfo entries
// //======================================
// async function getAllAccountInfo() {
//   try {
//     const pool = await sql.connect(dbConfig);
//     const result = await pool.request().execute("GetAccountInfo");
//     return result.recordset;
//   } catch (err) {
//     console.error("Database error in getAllAccountInfo:", err);
//     throw err;
//   }
// }

// //======================================
// // Get AccountInfo by AIID 
// //======================================
// async function getAccountInfoById(aiid) {
//   try {
//     const pool = await sql.connect(dbConfig);
//     const result = await pool.request()
//       .input("AIID", sql.Int, aiid)
//       .execute("GetAccountInfoByID");
//     return result.recordset[0] || null;
//   } catch (err) {
//     console.error("Database error in getAccountInfoById:", err);
//     throw err;
//   }
// }

// //======================================
// // Create AccountInfo entry
// //======================================
// async function createAccountInfo(data, changedBy = 1) {
//   try {
//     const {
//       AccountID,
//       VenueTypeID,
//       EntCityID,
//       isVenueCompany,
//       isEventCompany,
//       isRecordLabel
//     } = data;

//     const pool = await sql.connect(dbConfig);
//     await pool.request()
//       .input("AccountID", sql.Int, AccountID)
//       .input("VenueTypeID", sql.Int, VenueTypeID)
//       .input("EntCityID", sql.Int, EntCityID)
//       .input("isVenueCompany", sql.Bit, isVenueCompany)
//       .input("isEventCompany", sql.Bit, isEventCompany)
//       .input("isRecordLabel", sql.Bit, isRecordLabel)
//       .execute("CreateAccountInfo");

//     return { message: "AccountInfo created successfully" };
//   } catch (err) {
//     console.error("Database error in createAccountInfo:", err);
//     throw err;
//   }
// }

// //======================================
// // Update AccountInfo by AIID
// //======================================
// async function updateAccountInfo(aiid, updates, changedBy = 1) {
//   try {
//     const pool = await sql.connect(dbConfig);
//     await pool.request()
//       .input("AIID", sql.Int, aiid)
//       .input("AccountID", sql.Int, updates.AccountID)
//       .input("VenueTypeID", sql.Int, updates.VenueTypeID)
//       .input("EntCityID", sql.Int, updates.EntCityID)
//       .input("isVenueCompany", sql.Bit, updates.isVenueCompany)
//       .input("isEventCompany", sql.Bit, updates.isEventCompany)
//       .input("isRecordLabel", sql.Bit, updates.isRecordLabel)
//       .execute("UpdateAccountInfo");

//     return { message: "AccountInfo updated", AIID: aiid };
//   } catch (err) {
//     console.error("Database error in updateAccountInfo:", err);
//     throw err;
//   }
// }

// //======================================
// // Deactivate AccountInfo by AIID
// //======================================
// async function deactivateAccountInfo(aiid, changedBy = 1) {
//   try {
//     const pool = await sql.connect(dbConfig);
//     await pool.request()
//       .input("AIID", sql.Int, aiid)
//       .execute("DeactivateAccountInfo");

//     return { message: "AccountInfo deactivated", AIID: aiid };
//   } catch (err) {
//     console.error("Database error in deactivateAccountInfo:", err);
//     throw err;
//   }
// }

// //======================================
// // Reactivate AccountInfo by AIID
// //======================================
// async function reactivateAccountInfo(aiid, changedBy = 1) {
//   try {
//     const pool = await sql.connect(dbConfig);
//     await pool.request()
//       .input("AIID", sql.Int, aiid)
//       .execute("ReactivateAccountInfo");

//     return { message: "AccountInfo reactivated", AIID: aiid };
//   } catch (err) {
//     console.error("Database error in reactivateAccountInfo:", err);
//     throw err;
//   }
// }

// //======================================
// // Delete AccountInfo by AIID
// //======================================
// async function deleteAccountInfo(aiid, changedBy = 1) {
//   try {
//     const pool = await sql.connect(dbConfig);
//     await pool.request()
//       .input("AIID", sql.Int, aiid)
//       .execute("DeleteAccountInfo");

//     return { message: "AccountInfo permanently deleted", AIID: aiid };
//   } catch (err) {
//     console.error("Database error in deleteAccountInfo:", err);
//     throw err;
//   }
// }

// //======================================
// // Exports
// //======================================
// module.exports = {
//   getAllAccountInfo,
//   getAccountInfoById,
//   createAccountInfo,
//   updateAccountInfo,
//   deactivateAccountInfo,
//   reactivateAccountInfo,
//   deleteAccountInfo,
// };
