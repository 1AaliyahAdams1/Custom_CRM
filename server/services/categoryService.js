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