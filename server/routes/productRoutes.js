const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.post("/", productController.createProduct);
router.put("/:id", productController.updateProduct);
router.patch("/deactivate", productController.deactivateProduct);
router.patch("/reactivate", productController.reactivateProduct);
router.delete("/:id/delete", productController.deleteProduct);

module.exports = router;
