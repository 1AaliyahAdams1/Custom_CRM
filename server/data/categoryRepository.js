const sql = require("mssql");
const dbConfig = require("../dbConfig");

// =======================
// Get all categories
// =======================
async function getAllCategories() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().query(`
    SELECT * FROM Category
    ORDER BY CategoryName
  `);
  return result.recordset;
}

// =======================
// Get category by ID
// =======================
async function getCategoryById(categoryId) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input("CategoryID", sql.Int, categoryId)
    .query("SELECT * FROM Category WHERE CategoryID = @CategoryID");
  return result.recordset[0];
}

// =======================
// Create a new category
// =======================
async function createCategory(categoryName) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("CategoryName", sql.VarChar(255), categoryName)
    .query(`
      INSERT INTO Category (CategoryName)
      VALUES (@CategoryName)
    `);
}

// =======================
// Update an existing category
// =======================
async function updateCategory(categoryId, categoryName) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("CategoryID", sql.Int, categoryId)
    .input("CategoryName", sql.VarChar(255), categoryName)
    .query(`
      UPDATE Category
      SET CategoryName = @CategoryName
      WHERE CategoryID = @CategoryID
    `);
}

// =======================
// Delete a category (hard delete)
// =======================
async function deleteCategory(categoryId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("CategoryID", sql.Int, categoryId)
    .query("DELETE FROM Category WHERE CategoryID = @CategoryID");
}

// =======================
// Exports
// =======================
module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
