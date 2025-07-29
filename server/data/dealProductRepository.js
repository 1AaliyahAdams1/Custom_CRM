const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

// =======================
// Add a product to a deal
// =======================
async function addDealProduct(dealId, productId) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("DealID", sql.Int, dealId)
      .input("ProductID", sql.Int, productId)
      .query(`
        INSERT INTO DealProduct (DealID, ProductID)
        VALUES (@DealID, @ProductID)
      `);
    return { message: "Product added to deal." };
  } catch (error) {
    console.error("Error adding product to deal:", error);
    throw error;
  }
}
// =======================
// Remove a product from a deal
// =======================
async function removeDealProduct(dealId, productId) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("DealID", sql.Int, dealId)
      .input("ProductID", sql.Int, productId)
      .query(`
        DELETE FROM DealProduct
        WHERE DealID = @DealID AND ProductID = @ProductID
      `);
    return { message: "Product removed from deal." };
  } catch (error) {
    console.error("Error removing product from deal:", error);
    throw error;
  }
}

// =======================
// Get all products linked to a deal
// =======================
async function getProductsByDealId(dealId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("DealID", sql.Int, dealId)
      .query(`
        SELECT dp.DealProductID, dp.ProductID, p.ProductName
        FROM DealProduct dp
        JOIN Product p ON dp.ProductID = p.ProductID
        WHERE dp.DealID = @DealID
        ORDER BY p.ProductName
      `);
    return result.recordset;
  } catch (error) {
    console.error("Error fetching deal products:", error);
    throw error;
  }
}

//All stored procedures
//CreateDealProduct
// GetDealProduct
// GetDealProductByID
// UpdateDealProduct
// DeactivateDealProduct
// ReactivateDealProduct
// DeleteDealProduct

// =======================
// Exports
// =======================
module.exports = {
  addDealProduct,
  removeDealProduct,
  getProductsByDealId,
};
