const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

router.patch("/:id/deactivate", productController.deactivateProduct);
router.patch("/:id/reactivate", productController.reactivateProduct);
router.delete("/:id", productController.deleteProduct);
router.get("/:id", productController.getProductById);
router.put("/:id", productController.updateProduct);
router.get("/", productController.getAllProducts);
router.post("/", productController.createProduct);

module.exports = router;