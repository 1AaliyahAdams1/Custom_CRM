import api from '../utils/api';
const RESOURCE = '/categories';

//======================================
// Get all categories
//======================================
export async function getAllCategories() {
  try {
    const response = await api.get(RESOURCE);
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}
//======================================
// Get category by ID
//======================================
export async function getCategoryById(categoryId) {
  try {
    const response = await api.get(`${RESOURCE}/${categoryId}`);
    return response.data;
  }
    catch (error) {
    console.error(`Error fetching category with ID ${categoryId}:`, error);
    throw error;
  }
}
//======================================
// Create a new category
//======================================
export async function createCategory(categoryName) {
    try {
        const response = await api.post(RESOURCE, { categoryName });
        return response.data;
    }
    catch (error) {
        console.error('Error creating category:', error);
        throw error;
    }
}
//======================================
// Update an existing category
//======================================
export async function updateCategory(categoryId, categoryName) {
    try {
        const response = await api.put(`${RESOURCE}/${categoryId}`, { categoryName });
        return response.data;
    }
    catch (error) {
        console.error(`Error updating category with ID ${categoryId}:`, error);
        throw error;
    }
}
//======================================
// Deactivate a category
//======================================
export async function deactivateCategory(categoryId) {
    try {
        const response = await api.delete(`${RESOURCE}/${categoryId}`);
        return response.data;
    }
    catch (error) {
        console.error(`Error deactivating category with ID ${categoryId}:`, error);
        throw error;
    }
}
//======================================
// Reactivate a category
//======================================
export async function reactivateCategory(categoryId) {
    try {
        const response = await api.patch(`${RESOURCE}/${categoryId}/reactivate`);
        return response.data;
    }
    catch (error) {
        console.error(`Error reactivating category with ID ${categoryId}:`, error);
        throw error;
    }
}
//======================================
// Exports
//======================================
export default {
    getAllCategories,
    getCategoryById,
    createCategory, 
    updateCategory,
    deactivateCategory,
    reactivateCategory
};
