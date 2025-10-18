const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

//======================================
// Category Routes
//======================================
router.get("/", categoryController.getAllCategories);
router.get("/:categoryId", categoryController.getCategoryById);
router.post("/", categoryController.createCategory);
router.put("/:categoryId", categoryController.updateCategory);
router.delete("/:categoryId", categoryController.deactivateCategory);
router.post("/:categoryId/reactivate", categoryController.reactivateCategory);

module.exports = router;
