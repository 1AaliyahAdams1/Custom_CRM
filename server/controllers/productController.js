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
    // Validate that changedBy is provided
    if (!req.body.changedBy || req.body.changedBy === 0) {
      return res.status(400).json({ 
        error: "User authentication required. ChangedBy field is missing." 
      });
    }

    const result = await productService.createProduct(req.body, req.body.changedBy);
    res.status(201).json(result);
  } catch (err) {
    console.error("Error creating product:", err);
    
    // Handle specific SQL errors
    if (err.number === 547) { // Foreign key constraint
      return res.status(400).json({ 
        error: "Invalid user ID or referenced data does not exist" 
      });
    }
    if (err.number === 2627 || err.number === 2601) { // Unique constraint (duplicate SKU)
      return res.status(409).json({ 
        error: "Product with this SKU already exists" 
      });
    }
    
    res.status(500).json({ error: "Failed to create product" });
  }
}

async function updateProduct(req, res) {
  try {
    console.log('=== UPDATE PRODUCT CONTROLLER ===');
    console.log('Request Body:', req.body);
    
    // Validate that changedBy is provided
    if (!req.body.changedBy || req.body.changedBy === 0) {
      return res.status(400).json({ 
        error: "User authentication required. ChangedBy field is missing." 
      });
    }

    // Validate required fields
    if (!req.body.Price || req.body.Price === null) {
      return res.status(400).json({ 
        error: "Price is required and cannot be null" 
      });
    }

    const result = await productService.updateProduct(
      req.params.id, 
      req.body, 
      req.body.changedBy
    );
    
    res.json(result);
  } catch (err) {
    console.error("Error updating product:", err);
    
    // Handle specific SQL errors
    if (err.number === 547) {
      return res.status(400).json({ 
        error: "Invalid user ID or referenced data does not exist" 
      });
    }
    if (err.number === 2627 || err.number === 2601) {
      return res.status(409).json({ 
        error: "Product with this SKU already exists" 
      });
    }
    if (err.number === 515) {
      return res.status(400).json({ 
        error: "Required field is missing or null. Please check all required fields." 
      });
    }
    
    res.status(500).json({ error: "Failed to update product" });
  }
}

async function deactivateProduct(req, res) {
  try {
    // Get changedBy from request body
    const changedBy = req.body.changedBy || 0;
    
    if (changedBy === 0) {
      return res.status(400).json({ 
        error: "User authentication required" 
      });
    }

    const result = await productService.deactivateProduct(req.params.id, changedBy);
    res.json(result);
  } catch (err) {
    console.error("Error deactivating product:", err);
    res.status(500).json({ error: "Failed to deactivate product" });
  }
}

async function reactivateProduct(req, res) {
  try {
    // Get changedBy from request body
    const changedBy = req.body.changedBy || 0;
    
    if (changedBy === 0) {
      return res.status(400).json({ 
        error: "User authentication required" 
      });
    }

    const result = await productService.reactivateProduct(req.params.id, changedBy);
    res.json(result);
  } catch (err) {
    console.error("Error reactivating product:", err);
    res.status(500).json({ error: "Failed to reactivate product" });
  }
}


async function deleteProduct(req, res) {
  try {
    const result = await productService.deleteProduct(req.params.id, req.body.changedBy || 0);
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
