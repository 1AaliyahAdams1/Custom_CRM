const sql = require("mssql");
const dbConfig = require("../dbConfig");

// =======================
// Get all categories
// =======================
async function getAllCategories() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .query("SELECT * FROM Category WHERE Active = 1 ORDER BY CategoryName");
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
  INSERT INTO Category (CategoryName, Active) 
  VALUES (@CategoryName, 1);
  SELECT * FROM Category WHERE CategoryID = SCOPE_IDENTITY();
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
  WHERE CategoryID = @CategoryID;
  SELECT * FROM Category WHERE CategoryID = @CategoryID;
`);
}

// =======================
// Deactivate a category
// =======================
async function deactivateCategory(categoryId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("CategoryID", sql.Int, categoryId)
   .query(`
  UPDATE Category
  SET Active = 0 
  WHERE CategoryID = @CategoryID AND Active = 1;
  SELECT @@ROWCOUNT AS RowsAffected;
`);}

// =======================
// Reactivate a category
// =======================
async function reactivateCategory(categoryId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("CategoryID", sql.Int, categoryId)
    .query(`
  UPDATE Category
  SET Active = 1 
  WHERE CategoryID = @CategoryID AND Active = 0;
  SELECT @@ROWCOUNT AS RowsAffected;
`);
}

// =======================
// Delete a category 
// =======================
async function deleteCategory(categoryId) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("CategoryID", sql.Int, categoryId)
    .query(`
  DELETE FROM Category
  WHERE CategoryID = @CategoryID;
  SELECT @@ROWCOUNT AS RowsAffected;
`);
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