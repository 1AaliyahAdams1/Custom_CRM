const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

// =======================
// Get all products 
// =======================
async function getAllProducts() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().execute("getAllProducts");
  return result.recordset;
}

// =======================
// Get product by ID 
// =======================
async function getProductById(id) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("ProductID", sql.Int, id)
    .execute("getProductByID");
  return result.recordset[0];
}

// =======================
// Create product 
// =======================
async function createProduct(productData, changedBy = 0, actionTypeID) {
  const {
    AccountID,
    ProductName,
    Description,
    Price,
    Cost,
    SKU,
    CategoryID,
  } = productData;

  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("AccountID", sql.Int, AccountID)
    .input("ProductName", sql.VarChar(100), ProductName)
    .input("Description", sql.VarChar(255), Description)
    .input("Price", sql.Decimal(18, 2), Price)
    .input("Cost", sql.Decimal(18, 0), Cost)
    .input("SKU", sql.VarChar(255), SKU)
    .input("CategoryID", sql.Int, CategoryID)
    .input("ChangedBy", sql.Int, changedBy)
    .input("ActionTypeID", sql.Int, actionTypeID)
    .execute("createProduct");

  const newProductId = result.recordset?.[0]?.ProductID || null;
  return { ProductID: newProductId };
}

// =======================
// Update product 
// =======================
async function updateProduct(id, productData, changedBy = 0, actionTypeID) {
  const {
    AccountID,
    ProductName,
    Description,
    Price,
    Cost,
    SKU,
    CategoryID,
  } = productData;

  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("ProductID", sql.Int, id)
    .input("AccountID", sql.Int, AccountID)
    .input("ProductName", sql.VarChar(100), ProductName)
    .input("Description", sql.VarChar(255), Description)
    .input("Price", sql.Decimal(18, 2), Price)
    .input("Cost", sql.Decimal(18, 0), Cost)
    .input("SKU", sql.VarChar(255), SKU)
    .input("CategoryID", sql.Int, CategoryID)
    .input("ChangedBy", sql.Int, changedBy)
    .input("ActionTypeID", sql.Int, actionTypeID)
    .execute("updateProduct");

  return { message: "Product updated", ProductID: id };
}

// =======================
// Deactivate product + audit log
// =======================
async function deactivateProduct(productData, changedBy = 0, actionTypeID) {
  const {
    ProductID,
    AccountID,
    ProductName,
    Description,
    Price,
    Cost,
    SKU,
    CategoryID,
  } = productData;

  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("ProductID", sql.Int, ProductID)
    .input("AccountID", sql.Int, AccountID)
    .input("ProductName", sql.VarChar(100), ProductName)
    .input("Description", sql.VarChar(255), Description)
    .input("Price", sql.Decimal(18, 2), Price)
    .input("Cost", sql.Decimal(18, 0), Cost)
    .input("SKU", sql.VarChar(255), SKU)
    .input("CategoryID", sql.Int, CategoryID)
    .input("ChangedBy", sql.Int, changedBy)
    .input("ActionTypeID", sql.Int, actionTypeID)
    .execute("deactivateProduct");

  return { message: "Product deactivated", ProductID };
}

// =======================
// Reactivate product + audit log
// =======================
async function reactivateProduct(productData, changedBy = 0, actionTypeID) {
  const {
    ProductID,
    AccountID,
    ProductName,
    Description,
    Price,
    Cost,
    SKU,
    CategoryID,
  } = productData;

  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("ProductID", sql.Int, ProductID)
    .input("AccountID", sql.Int, AccountID)
    .input("ProductName", sql.VarChar(100), ProductName)
    .input("Description", sql.VarChar(255), Description)
    .input("Price", sql.Decimal(18, 2), Price)
    .input("Cost", sql.Decimal(18, 0), Cost)
    .input("SKU", sql.VarChar(255), SKU)
    .input("CategoryID", sql.Int, CategoryID)
    .input("ChangedBy", sql.Int, changedBy)
    .input("ActionTypeID", sql.Int, actionTypeID)
    .execute("reactivateProduct");

  return { message: "Product reactivated", ProductID };
}

// =======================
// Delete product + audit log
// =======================
async function deleteProduct(productData, changedBy = 0, actionTypeID) {
  const {
    ProductID,
    AccountID,
    ProductName,
    Description,
    Price,
    Cost,
    SKU,
    CategoryID,
  } = productData;

  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("ProductID", sql.Int, ProductID)
    .input("AccountID", sql.Int, AccountID)
    .input("ProductName", sql.VarChar(100), ProductName)
    .input("Description", sql.VarChar(255), Description)
    .input("Price", sql.Decimal(18, 2), Price)
    .input("Cost", sql.Decimal(18, 0), Cost)
    .input("SKU", sql.VarChar(255), SKU)
    .input("CategoryID", sql.Int, CategoryID)
    .input("ChangedBy", sql.Int, changedBy)
    .input("ActionTypeID", sql.Int, actionTypeID)
    .execute("deleteProduct");

  return { message: "Product deleted", ProductID };
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deactivateProduct,
  reactivateProduct,
  deleteProduct,
};

//All stored procedures
//insertTempProduct
//getAllProducts
//getProductByID
//getIDByProduct
//createProduct
//updateProduct
//deactivateProduct
//reactivateProduct
//deleteProduct