// const sql = require("mssql");
// const { dbConfig } = require("../../dbConfig");

// // =======================
// // Get all users with active access to a specific DealRoom
// // =======================
// async function getUsersWithAccess(dealRoomId) {
//   if (!dealRoomId) throw new Error("dealRoomId is required");

//   try {
//     const pool = await sql.connect(dbConfig);
//     const result = await pool.request()
//       .input("DealRoomID", sql.Int, dealRoomId)
//       .query(`
//         SELECT dra.*, u.Username
//         FROM DealRoomAccess dra
//         JOIN Users u ON dra.UserID = u.UserID
//         WHERE dra.DealRoomID = @DealRoomID AND dra.Active = 1
//       `);
//     return result.recordset;
//   } catch (error) {
//     console.error("DealRoomAccess Repo Error [getUsersWithAccess]:", error);
//     throw error;
//   }
// }

// // =======================
// // Grant a user access to a dealroom
// // =======================
// async function grantAccessToDealRoom(dealRoomId, userId, grantedBy) {
//   if (!dealRoomId) throw new Error("dealRoomId is required");
//   if (!userId) throw new Error("userId is required");
//   if (!grantedBy) throw new Error("grantedBy is required");

//   try {
//     const pool = await sql.connect(dbConfig);
//     await pool.request()
//       .input("DealRoomID", sql.Int, dealRoomId)
//       .input("UserID", sql.Int, userId)
//       .input("GrantedBy", sql.Int, grantedBy)
//       .execute("CreateDealRoomAccess");
//   } catch (error) {
//     console.error("DealRoomAccess Repo Error [grantAccessToDealRoom]:", error);
//     throw error;
//   }
// }

// // =======================
// // Deactivate access for a user in a dealroom by DealRoomAccessID
// // =======================
// async function revokeAccess(dealRoomAccessId) {
//   if (!dealRoomAccessId) throw new Error("dealRoomAccessId is required");

//   try {
//     const pool = await sql.connect(dbConfig);
//     await pool.request()
//       .input("DealRoomAccessID", sql.Int, dealRoomAccessId)
//       .execute("DeactivateDealRoomAccess");
//   } catch (error) {
//     console.error("DealRoomAccess Repo Error [revokeAccess]:", error);
//     throw error;
//   }
// }

// // =======================
// // Reactivate access for a user in a dealroom by DealRoomAccessID
// // =======================
// async function reactivateAccess(dealRoomAccessId) {
//   if (!dealRoomAccessId) throw new Error("dealRoomAccessId is required");

//   try {
//     const pool = await sql.connect(dbConfig);
//     await pool.request()
//       .input("DealRoomAccessID", sql.Int, dealRoomAccessId)
//       .execute("ReactivateDealRoomAccess");
//   } catch (error) {
//     console.error("DealRoomAccess Repo Error [reactivateAccess]:", error);
//     throw error;
//   }
// }

// // =======================
// // Delete an inactive DealRoomAccess record by DealRoomAccessID
// // =======================
// async function deleteAccess(dealRoomAccessId) {
//   if (!dealRoomAccessId) throw new Error("dealRoomAccessId is required");

//   try {
//     const pool = await sql.connect(dbConfig);
//     await pool.request()
//       .input("DealRoomAccessID", sql.Int, dealRoomAccessId)
//       .execute("DeleteDealRoomAccess");
//   } catch (error) {
//     console.error("DealRoomAccess Repo Error [deleteAccess]:", error);
//     throw error;
//   }
// }

// // =======================
// // Get all DealRoomAccess records
// // =======================
// async function getAllAccessRecords() {
//   try {
//     const pool = await sql.connect(dbConfig);
//     const result = await pool.request()
//       .execute("GetDealRoomAccess");
//     return result.recordset;
//   } catch (error) {
//     console.error("DealRoomAccess Repo Error [getAllAccessRecords]:", error);
//     throw error;
//   }
// }

// // =======================
// // Get specific DealRoomAccess by ID
// // =======================
// async function getAccessById(dealRoomAccessId) {
//   if (!dealRoomAccessId) throw new Error("dealRoomAccessId is required");

//   try {
//     const pool = await sql.connect(dbConfig);
//     const result = await pool.request()
//       .input("DealRoomAccessID", sql.Int, dealRoomAccessId)
//       .execute("GetDealRoomAccessByID");
//     return result.recordset[0] || null;
//   } catch (error) {
//     console.error("DealRoomAccess Repo Error [getAccessById]:", error);
//     throw error;
//   }
// }

// // =======================
// // Update DealRoomAccess by ID
// // =======================
// async function updateAccess(dealRoomAccessId, dealRoomId, userId, grantedBy) {
//   if (!dealRoomAccessId) throw new Error("dealRoomAccessId is required");
//   if (!dealRoomId) throw new Error("dealRoomId is required");
//   if (!userId) throw new Error("userId is required");
//   if (!grantedBy) throw new Error("grantedBy is required");

//   try {
//     const pool = await sql.connect(dbConfig);
//     await pool.request()
//       .input("DealRoomAccessID", sql.Int, dealRoomAccessId)
//       .input("DealRoomID", sql.Int, dealRoomId)
//       .input("UserID", sql.Int, userId)
//       .input("GrantedBy", sql.Int, grantedBy)
//       .execute("UpdateDealRoomAccess");
//   } catch (error) {
//     console.error("DealRoomAccess Repo Error [updateAccess]:", error);
//     throw error;
//   }
// }

// module.exports = {
//   getUsersWithAccess,
//   grantAccessToDealRoom,
//   revokeAccess,
//   reactivateAccess,
//   deleteAccess,
//   getAllAccessRecords,
//   getAccessById,
//   updateAccess,
// };