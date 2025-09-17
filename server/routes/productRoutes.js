const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.post("/", productController.createProduct);
router.put("/:id", productController.updateProduct);
router.delete("/products/:id", productController.deleteProduct);
router.patch("/products/:id/deactivate", productController.deactivateProduct);
router.patch("/products/:id/reactivate", productController.reactivateProduct);

module.exports = router;
