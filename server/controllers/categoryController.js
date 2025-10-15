const categoryService = require('../services/categoryService');

//======================================
// Get all categories
//======================================
async function getAllCategories(req, res) {
    try {
        const categories = await categoryService.getAllCategories();
        res.status(200).json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
//======================================
// Get category by ID
//======================================
async function getCategoryById(req, res) {
    const { categoryId } = req.params;
    try {
        const category = await categoryService.getCategoryById(categoryId);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.status(200).json(category);
    }
    catch (error) {
        console.error(`Error fetching category with ID ${categoryId}:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
//======================================
// Create a new category
//======================================
async function createCategory(req, res) {
    const { categoryName } = req.body;
    if (!categoryName) {
        return res.status(400).json({ error: 'Category name is required' });
    }
    try {
        const newCategory = await categoryService.createCategory(categoryName);
        res.status(201).json(newCategory);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
//======================================
// Update an existing category
//======================================
async function updateCategory(req, res) {
    const { categoryId } = req.params;
    const { categoryName } = req.body;
    if (!categoryName) {
        return res.status(400).json({ error: 'Category name is required' });
    }
    try {
        const updatedCategory = await categoryService.updateCategory(categoryId, categoryName);
        if (!updatedCategory) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.status(200).json(updatedCategory);
    }
    catch (error) {
        console.error(`Error updating category with ID ${categoryId}:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
//======================================
// Deactivate a category
//======================================
async function deactivateCategory(req, res) {
    const { categoryId } = req.params;
    try {
        const result = await categoryService.deactivateCategory(categoryId);
        if (!result) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.status(200).json({ message: 'Category deactivated successfully' });
    } catch (error) {
        console.error(`Error deactivating category with ID ${categoryId}:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
//======================================
// Reactivate a category
//======================================
async function reactivateCategory(req, res) {
    const { categoryId } = req.params;
    try {
        const result = await categoryService.reactivateCategory(categoryId);
        if (!result) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.status(200).json({ message: 'Category reactivated successfully' });
    } catch (error) {
        console.error(`Error reactivating category with ID ${categoryId}:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
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