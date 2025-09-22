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

async function updateProduct(id, data, changedBy = 2) {

  return await productRepo.updateProduct(id, data, changedBy, 2);
}

async function deleteProduct(productId, changedBy) {
  return await productRepository.deleteProduct(productId, changedBy);
}

async function deactivateProduct(productId, changedBy) {
  return await productRepository.deactivateProduct(productId, changedBy);
}

async function reactivateProduct(productId, changedBy) {
  return await productRepository.reactivateProduct(productId, changedBy);
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
