<<<<<<< HEAD
const categoryRepository = require('../data/categoryRepository');

//======================================
// Get all categories
//======================================
async function getAllCategories() {
    return await categoryRepository.getAllCategories();
}
//======================================
// Get category by ID
//======================================
async function getCategoryById(categoryId) {
    return await categoryRepository.getCategoryById(categoryId);
}
//======================================
// Create a new category
//======================================
async function createCategory(categoryName) {
    return await categoryRepository.createCategory(categoryName);
}
//======================================
// Update an existing category
//======================================
async function updateCategory(categoryId, categoryName) {
    return await categoryRepository.updateCategory(categoryId, categoryName);
}
//======================================
// Deactivate a category
//======================================
async function deactivateCategory(categoryId) {
    return await categoryRepository.deactivateCategory(categoryId);
}
//======================================
// Reactivate a category
//======================================
async function reactivateCategory(categoryId) {
    return await categoryRepository.reactivateCategory(categoryId);
}
//======================================
// Exports
//======================================
module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deactivateCategory,
    reactivateCategory
};
=======
const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

class CategoryService {
  static async getAllCategories() {
    try {
      console.log("🟢 CategoryService: Fetching all categories...");
      const pool = await sql.connect(dbConfig);
      const result = await pool.request().query(`
        SELECT CategoryID, CategoryName, Active
        FROM dbo.Category
        WHERE Active = 1
        ORDER BY CategoryName ASC
      `);
      console.log("🟢 CategoryService: Found", result.recordset.length, "categories");
      return result.recordset;
    } catch (error) {
      console.error("🔴 CategoryService Error [getAllCategories]:", error);
      throw error;
    }
  }

  static async createCategory(data) {
    try {
      console.log("🟢 CategoryService: Creating category with data:", data);
      if (!data || !data.CategoryName || !data.CategoryName.trim()) {
        throw new Error("CategoryName is required");
      }

      const pool = await sql.connect(dbConfig);
      const insertResult = await pool.request()
        .input("CategoryName", sql.VarChar(255), data.CategoryName.trim())
        .input("Active", sql.Bit, data.Active !== false ? 1 : 0)
        .query(`
          INSERT INTO dbo.Category (CategoryName, Active)
          VALUES (@CategoryName, @Active);
          SELECT SCOPE_IDENTITY() as NewCategoryID;
        `);

      const newCategoryId = insertResult.recordset[0].NewCategoryID;
      console.log("🟢 CategoryService: Inserted category with ID:", newCategoryId);

      const selectResult = await pool.request()
        .input("CategoryID", sql.Int, newCategoryId)
        .query(`
          SELECT CategoryID, CategoryName, Active
          FROM dbo.Category
          WHERE CategoryID = @CategoryID
        `);

      const newCategory = selectResult.recordset[0];
      console.log("🟢 CategoryService: Successfully created category:", newCategory);
      return newCategory;
    } catch (error) {
      console.error("🔴 CategoryService Error [createCategory]:", error);
      throw error;
    }
  }
}

module.exports = CategoryService;


>>>>>>> ea839b4db07b3dad90afd56e3760b09b150ea2f7
