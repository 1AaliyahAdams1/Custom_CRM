const productRepo = require("../data/productRepository");

async function getAllProducts() {
  return await productRepo.getAllProducts();
}

async function getProductById(id) {
  return await productRepo.getProductById(id);
}

async function createProduct(data, changedBy = 0) {
  return await productRepo.createProduct(data, changedBy, 1);
}

async function updateProduct(id, data, changedBy = 0) {
  return await productRepo.updateProduct(id, data, changedBy, 2);
}

async function deleteProduct(productId, changedBy = 0) {
  return await productRepo.deleteProduct(productId, changedBy, 5);
}

async function deactivateProduct(productId, changedBy = 0) {
  return await productRepo.deactivateProduct(productId, changedBy, 3);
}

async function reactivateProduct(productId, changedBy = 0) {
  return await productRepo.reactivateProduct(productId, changedBy, 4);
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deactivateProduct,
  reactivateProduct,
  deleteProduct,
};