const productService = require("../services/productService");

async function getAllProducts(req, res) {
  try {
    const data = await productService.getAllProducts();
    res.json(data);
  } catch (err) {
    console.error("Error getting all products:", err);
    res.status(500).json({ error: "Failed to get products" });
  }
}

async function getProductById(req, res) {
  try {
    const data = await productService.getProductById(req.params.id);
    res.json(data);
  } catch (err) {
    console.error("Error getting product by ID:", err);
    res.status(500).json({ error: "Failed to get product" });
  }
}

async function createProduct(req, res) {
  try {
    const result = await productService.createProduct(req.body, req.body.changedBy || 0);
    res.status(201).json(result);
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ error: "Failed to create product" });
  }
}

async function updateProduct(req, res) {
  try {
    const result = await productService.updateProduct(req.params.id, req.body, req.body.changedBy || 0);
    res.json(result);
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
}

async function deactivateProduct(req, res) {
  try {
    const result = await productService.deactivateProduct(req.body, req.body.changedBy || 0);
    res.json(result);
  } catch (err) {
    console.error("Error deactivating product:", err);
    res.status(500).json({ error: "Failed to deactivate product" });
  }
}

async function reactivateProduct(req, res) {
  try {
    const result = await productService.reactivateProduct(req.body, req.body.changedBy || 0);
    res.json(result);
  } catch (err) {
    console.error("Error reactivating product:", err);
    res.status(500).json({ error: "Failed to reactivate product" });
  }
}

async function deleteProduct(req, res) {
  try {
    const result = await productService.deleteProduct(req.body, req.body.changedBy || 0);
    res.json(result);
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
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
