const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

// =======================
// Create a new DealProduct
// =======================
async function createDealProduct(dealId, productId) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("DealID", sql.Int, dealId)
      .input("ProductID", sql.Int, productId)
      .execute("CreateDealProduct");
    return { message: "DealProduct created successfully." };
  } catch (error) {
    console.error("DealProduct Repo Error [createDealProduct]:", error);
    throw error;
  }
}

// =======================
// Get all active DealProducts
// =======================
async function getAllDealProducts() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .execute("GetDealProduct");
    return result.recordset;
  } catch (error) {
    console.error("DealProduct Repo Error [getAllDealProducts]:", error);
    throw error;
  }
}

// =======================
// Get DealProduct by ID
// =======================
async function getDealProductById(dealProductId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("DealProductID", sql.Int, dealProductId)
      .execute("GetDealProductByID");
    return result.recordset[0];
  } catch (error) {
    console.error("DealProduct Repo Error [getDealProductById]:", error);
    throw error;
  }
}

// =======================
// Update DealProduct
// =======================
async function updateDealProduct(dealProductId, dealId, productId) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("DealProductID", sql.Int, dealProductId)
      .input("DealID", sql.Int, dealId)
      .input("ProductID", sql.Int, productId)
      .execute("UpdateDealProduct");
    return { message: "DealProduct updated successfully." };
  } catch (error) {
    console.error("DealProduct Repo Error [updateDealProduct]:", error);
    throw error;
  }
}

// =======================
// Deactivate DealProduct
// =======================
async function deactivateDealProduct(dealProductId) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("DealProductID", sql.Int, dealProductId)
      .execute("DeactivateDealProduct");
    return { message: "DealProduct deactivated successfully." };
  } catch (error) {
    console.error("DealProduct Repo Error [deactivateDealProduct]:", error);
    throw error;
  }
}

// =======================
// Reactivate DealProduct
// =======================
async function reactivateDealProduct(dealProductId) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("DealProductID", sql.Int, dealProductId)
      .execute("ReactivateDealProduct");
    return { message: "DealProduct reactivated successfully." };
  } catch (error) {
    console.error("DealProduct Repo Error [reactivateDealProduct]:", error);
    throw error;
  }
}

// =======================
// Hard delete DealProduct
// =======================
async function deleteDealProduct(dealProductId) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("DealProductID", sql.Int, dealProductId)
      .execute("DeleteDealProduct");
    return { message: "DealProduct deleted successfully." };
  } catch (error) {
    console.error("DealProduct Repo Error [deleteDealProduct]:", error);
    throw error;
  }
}

// =======================
// Exports
// =======================
module.exports = {
  createDealProduct,
  getAllDealProducts,
  getDealProductById,
  updateDealProduct,
  deactivateDealProduct,
  reactivateDealProduct,
  deleteDealProduct,
};
