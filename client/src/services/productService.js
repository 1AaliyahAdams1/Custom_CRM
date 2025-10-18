import api from '../utils/api';

const RESOURCE = '/products';

export async function getAllProducts() {
  try {
    const response = await api.get(RESOURCE);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

export async function getProductById(productId) {
  try {
    const response = await api.get(`${RESOURCE}/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    throw error;
  }
}

export async function createProduct(productData) {
  try {
    const response = await api.post(RESOURCE, productData);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

export async function updateProduct(productId, productData) {
  try {
    const response = await api.put(`${RESOURCE}/${productId}`, productData);
    return response.data;
  } catch (error) {
    console.error(`Error updating product ${productId}:`, error);
    throw error;
  }
}

export async function deleteProduct(productId) {
  try {
    const response = await api.delete(`${RESOURCE}/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting product ${productId}:`, error);
    throw error;
  }
}

export async function deactivateProduct(productId) {
  try {
    const response = await api.patch(`${RESOURCE}/${productId}/deactivate`);
    return response.data;
  } catch (error) {
    console.error(`Error deactivating product ${productId}:`, error);
    throw error;
  }
}

export async function reactivateProduct(productId) {
  try {
    const response = await api.patch(`${RESOURCE}/${productId}/reactivate`);
    return response.data;
  } catch (error) {
    console.error(`Error reactivating product ${productId}:`, error);
    throw error;
  }
}