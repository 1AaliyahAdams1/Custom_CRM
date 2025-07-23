const productService = require("../services/productService");

// Get the username of the person making changes (or fallback to "System")
function getChangedBy(req) {
  return req.user?.username || "System";
}

// GET products
async function getAllProducts(req, res) {
  try {
    // can add validation here
    const products = await productService.getAllProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getProductById(req, res) {
  try {
    // Can add validation here
    const product = await productService.getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createProduct(req, res) {
  try {
    const product = await productService.createProduct(req.body, getChangedBy(req));
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function updateProduct(req, res) {
  try {
    const product = await productService.updateProduct(req.params.id, req.body, getChangedBy(req));
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function deleteProduct(req, res) {
  try {
    const result = await productService.deleteProduct(req.params.id, getChangedBy(req));
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
  deleteProduct,
};
