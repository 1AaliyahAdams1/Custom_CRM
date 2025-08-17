const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

// =======================
// Create a new DealProduct
// =======================
async function createDealProduct(dealId, productId) {
  if (!dealId) throw new Error("Deal ID is required");
  if (!productId) throw new Error("Product ID is required");

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("DealID", sql.Int, dealId)
      .input("ProductID", sql.Int, productId)
      .execute("CreateDealProduct");

    return {
      message: "DealProduct created successfully",
      DealProductID: result.recordset[0]?.DealProductID || null,
    };
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
    const result = await pool.request().execute("GetDealProduct");
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
  if (!dealProductId) throw new Error("DealProduct ID is required");

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("DealProductID", sql.Int, dealProductId)
      .execute("GetDealProductByID");

    if (!result.recordset.length) {
      throw new Error("DealProduct not found");
    }

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
  if (!dealProductId) throw new Error("DealProduct ID is required");
  if (!dealId) throw new Error("Deal ID is required");
  if (!productId) throw new Error("Product ID is required");

  try {
    const pool = await sql.connect(dbConfig);

    // Check if DealProduct exists
    const existing = await pool
      .request()
      .input("DealProductID", sql.Int, dealProductId)
      .execute("GetDealProductByID");

    if (!existing.recordset.length) {
      throw new Error("DealProduct not found");
    }

    await pool
      .request()
      .input("DealProductID", sql.Int, dealProductId)
      .input("DealID", sql.Int, dealId)
      .input("ProductID", sql.Int, productId)
      .execute("UpdateDealProduct");

    return {
      message: "DealProduct updated successfully",
      DealProductID: dealProductId,
    };
  } catch (error) {
    console.error("DealProduct Repo Error [updateDealProduct]:", error);
    throw error;
  }
}

// =======================
// Deactivate DealProduct
// =======================
async function deactivateDealProduct(dealProductId) {
  if (!dealProductId) throw new Error("DealProduct ID is required");

  try {
    const pool = await sql.connect(dbConfig);

    // Check if DealProduct exists
    const existing = await pool
      .request()
      .input("DealProductID", sql.Int, dealProductId)
      .execute("GetDealProductByID");

    if (!existing.recordset.length) {
      throw new Error("DealProduct not found");
    }

    await pool
      .request()
      .input("DealProductID", sql.Int, dealProductId)
      .execute("DeactivateDealProduct");

    return {
      message: "DealProduct deactivated successfully",
      DealProductID: dealProductId,
    };
  } catch (error) {
    console.error("DealProduct Repo Error [deactivateDealProduct]:", error);
    throw error;
  }
}

// =======================
// Reactivate DealProduct
// =======================
async function reactivateDealProduct(dealProductId) {
  if (!dealProductId) throw new Error("DealProduct ID is required");

  try {
    const pool = await sql.connect(dbConfig);

    // Check if DealProduct exists
    const existing = await pool
      .request()
      .input("DealProductID", sql.Int, dealProductId)
      .execute("GetDealProductByID");

    if (!existing.recordset.length) {
      throw new Error("DealProduct not found");
    }

    await pool
      .request()
      .input("DealProductID", sql.Int, dealProductId)
      .execute("ReactivateDealProduct");

    return {
      message: "DealProduct reactivated successfully",
      DealProductID: dealProductId,
    };
  } catch (error) {
    console.error("DealProduct Repo Error [reactivateDealProduct]:", error);
    throw error;
  }
}

// =======================
// Hard delete DealProduct
// =======================
async function deleteDealProduct(dealProductId) {
  if (!dealProductId) throw new Error("DealProduct ID is required");

  try {
    const pool = await sql.connect(dbConfig);

    // Check if DealProduct exists
    const existing = await pool
      .request()
      .input("DealProductID", sql.Int, dealProductId)
      .execute("GetDealProductByID");

    if (!existing.recordset.length) {
      throw new Error("DealProduct not found");
    }

    await pool
      .request()
      .input("DealProductID", sql.Int, dealProductId)
      .execute("DeleteDealProduct");

    return {
      message: "DealProduct deleted successfully",
      DealProductID: dealProductId,
    };
  } catch (error) {
    console.error("DealProduct Repo Error [deleteDealProduct]:", error);
    throw error;
  }
}

// =======================
// Get DealProducts by Deal ID
// =======================
async function getDealProductsByDealId(dealId) {
  if (!dealId) throw new Error("Deal ID is required");

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().input("DealID", sql.Int, dealId).query(`
        SELECT dp.*, p.ProductName, p.Price 
        FROM DealProduct dp 
        JOIN Product p ON dp.ProductID = p.ProductID 
        WHERE dp.DealID = @DealID AND dp.Active = 1
      `);

    return result.recordset;
  } catch (error) {
    console.error("DealProduct Repo Error [getDealProductsByDealId]:", error);
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
  getDealProductsByDealId,
};
