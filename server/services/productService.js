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

async function deactivateProduct(data, changedBy = 0) {

  return await productRepo.deactivateProduct(data, changedBy, 8);
}

async function reactivateProduct(data, changedBy = 0) {

  return await productRepo.reactivateProduct(data, changedBy, 7);
}

async function deleteProduct(data, changedBy = 0) {
  return await productRepo.deleteProduct(data, changedBy, 3);
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
