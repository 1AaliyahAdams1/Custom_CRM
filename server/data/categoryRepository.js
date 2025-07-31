const sql = require("mssql");
const dbConfig = require("../dbConfig");

// =======================
// Get all categories
// =======================
async function getAllCategories() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .execute("GetAllCategories");
  return result.recordset;
}

// =======================
// Get category by ID
// =======================
async function getCategoryById(categoryId) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("CategoryID", sql.Int, categoryId)
    .execute("GetCategoryByID");
  return result.recordset[0];
}

// =======================
// Create a new category
// =======================
async function createCategory(categoryName) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("CategoryName", sql.VarChar(255), categoryName)
    .execute("CreateCategory");
}

// =======================
// Update an existing category
// =======================
async function updateCategory(categoryId, categoryName) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("CategoryID", sql.Int, categoryId)
    .input("CategoryName", sql.VarChar(255), categoryName)
    .execute("UpdateCategory");
}

// =======================
// Deactivate a category
// =======================
async function deactivateCategory(categoryId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("CategoryID", sql.Int, categoryId)
    .execute("DeactivateCategory");
}

// =======================
// Reactivate a category
// =======================
async function reactivateCategory(categoryId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("CategoryID", sql.Int, categoryId)
    .execute("ReactivateCategory");
}

// =======================
// Delete a category 
// =======================
async function deleteCategory(categoryId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("CategoryID", sql.Int, categoryId)
    .execute("DeleteCategory");
}

// =======================
// Exports
// =======================
module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deactivateCategory,
  reactivateCategory,
  deleteCategory,
};