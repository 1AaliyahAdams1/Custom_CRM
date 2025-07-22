const productRepo = require("../data/productRepository");

// Fetch all products from repository
async function getAllProducts() {
  return await productRepo.getAllProducts();
}

// Get a product by its ID
async function getProductById(id) {
  return await productRepo.getProductById(id);
}

// Create a new product with a basic price check
async function createProduct(data, changedBy) {
  // business rule: Price must be > 0
  if (data.Price <= 0) {
    throw new Error("Price must be greater than zero.");
  }

  return await productRepo.createProduct(data, changedBy);
}

// Update an existing product after checking price
async function updateProduct(id, data, changedBy) {
  if (data.Price <= 0) {
    throw new Error("Price must be greater than zero.");
  }

  return await productRepo.updateProduct(id, data, changedBy);
}

// Delete a product
async function deleteProduct(id, changedBy) {
  return await productRepo.deleteProduct(id, changedBy);
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
