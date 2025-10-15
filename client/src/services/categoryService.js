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


