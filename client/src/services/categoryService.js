<<<<<<< HEAD
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
=======
import api from "../utils/api";

const RESOURCE = "/categories";

export const getAllCategories = async () => {
  try {
    console.log("🔵 Frontend Service: Fetching categories...");
    const response = await api.get(RESOURCE);
    console.log("🔵 Frontend Service: Categories received:", response?.data);
    return response.data;
  } catch (error) {
    console.error("🔴 Frontend Service: Error fetching categories:", error?.response || error);
    throw error;
  }
};

export const createCategory = async (categoryData) => {
  try {
    console.log("🔵 Frontend Service: Creating category with data:", categoryData);

    if (!categoryData?.CategoryName || !categoryData.CategoryName.trim()) {
      throw new Error("Category name cannot be empty");
    }

    const payload = {
      CategoryName: categoryData.CategoryName.trim(),
      Active: categoryData.Active !== false,
    };

    const response = await api.post(RESOURCE, payload);
    console.log("🔵 Frontend Service: Category created:", response?.data);
    return response.data;
  } catch (error) {
    console.error("🔴 Frontend Service: Error creating category:", error?.response || error);
    throw error;
  }
};


>>>>>>> ea839b4db07b3dad90afd56e3760b09b150ea2f7
