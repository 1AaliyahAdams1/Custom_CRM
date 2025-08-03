const productService = require("../services/productService");

async function getAllProducts(req, res) {
  try {
    const data = await productService.getAllProducts();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getProductById(req, res) {
  try {
    const data = await productService.getProductById(parseInt(req.params.id));
    if (!data) return res.status(404).json({ message: "Product not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createProduct(req, res) {
  try {
    const result = await productService.createProduct(req.body, req.body.changedBy || 0);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateProduct(req, res) {
  try {
    const result = await productService.updateProduct(parseInt(req.params.id), req.body, req.body.changedBy || 0);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deactivateProduct(req, res) {
  try {
    const result = await productService.deactivateProduct(req.body, req.body.changedBy || 0);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function reactivateProduct(req, res) {
  try {
    const result = await productService.reactivateProduct(req.body, req.body.changedBy || 0);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteProduct(req, res) {
  try {
    const result = await productService.deleteProduct(req.body, req.body.changedBy || 0);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
