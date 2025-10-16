const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

//======================================
// Category Routes
//======================================
// Get all categories
router.get("/", categoryController.getAllCategories);
// Get category by ID
router.get("/:categoryId", categoryController.getCategoryById);
// Create a new category
router.post("/", categoryController.createCategory);
// Update an existing category
router.put("/:categoryId", categoryController.updateCategory);
// Deactivate a category
router.delete("/:categoryId", categoryController.deactivateCategory);
// Reactivate a category
router.post("/:categoryId/reactivate", categoryController.reactivateCategory);

module.exports = router;
